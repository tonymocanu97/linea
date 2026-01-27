using Linea.Application.DTOs;
using Linea.Application.DTOs.Dashboard;
using Linea.Application.Interfaces;
using Linea.Domain.Entities;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Linea.Infrastructure.Services
{
    public sealed class DashboardService : IDashboardservice
    {
        private readonly LineaDbContext _database;

        public DashboardService(LineaDbContext database)
        {
            _database = database;
        }

        public async Task<DashboardSummary> GetSummaryAsync(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken = default)
        {
            if (to < from)
            {
                throw new ArgumentException("'to' date must be greater than or equal to 'from' date.");
            }

            var query = _database.ProductionReports.AsNoTracking().AsQueryable();
            query = query.Where(r => r.Date >= from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc) && r.Date <= to.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc));

            if (!string.IsNullOrWhiteSpace(lineName))
            {
                query = query.Where(r => r.LineName == lineName.Trim());
            }

            var reportIds = await query.Select(r => r.Id).ToListAsync(cancellationToken);

            var totals = await query.GroupBy(r => 1)
                .Select(g => new
                {
                    Good = g.Sum(x => x.GoodCount),
                    Scrap = g.Sum(x => x.ScrapCount)
                })
                .FirstOrDefaultAsync(cancellationToken) ?? new { Good = 0, Scrap = 0 };

            var totalDowntime = await _database.Downtimes.AsNoTracking()
                .Where(d => reportIds.Contains(d.ProductionReportId))
                .SumAsync(d => (int)Math.Max(0, (d.EndTime - d.StartTime).TotalMinutes), cancellationToken);

            var topDefects = await _database.Defects.AsNoTracking()
                .Where(d => reportIds.Contains(d.ProductionReportId))
                .GroupBy(d => d.Type)
                .OrderByDescending(g => g.Sum(x => x.Quantity))
                .Select(g => new TopDefectDto(g.Key, g.Sum(x => x.Quantity)))
                .Take(5)
                .ToListAsync(cancellationToken);

            var totalProduced = totals.Good + totals.Scrap;
            var scrapRate = totalProduced == 0 ? 0m : (decimal)totals.Scrap * 100m / totalProduced;

            return new DashboardSummary
            (
                From: from,
                To: to,
                LineName: lineName,
                TotalGood: totals.Good,
                TotalScrap: totals.Scrap,
                ScrapRatePercent: Math.Round(scrapRate, 2),
                TotalDowntime: totalDowntime,
                TopDefects: topDefects
            );
        }

        public async Task<List<HourlyProductionPoint>> GetHourlyProduction(DateOnly from, DateOnly to, string? lineName = null, CancellationToken cancellationToken = default)
        {
            if (to < from)
            {
                throw new ArgumentException("'to' date must be greater than or equal to 'from' date.");
            }

            var query = _database.ProductionReports.AsNoTracking().AsQueryable();
            query = query.Where(r => r.Date >= from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc) && r.Date <= to.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc));

            if (!string.IsNullOrWhiteSpace(lineName))
            {
                query = query.Where(r => r.LineName == lineName);
            }

            var reports = await query.ToListAsync();

            var hourlyData = reports
                .GroupBy(r => r.Date.Hour)
                .Select(g => new HourlyProductionPoint
                {
                    Hour = g.Key,
                    Production = g.Sum(r => r.GoodCount + r.ScrapCount),
                    Target = 83
                })
                .OrderBy(h => h.Hour)
                .ToList();

            return hourlyData;
        }

        public async Task<List<ActiveDowntimeDto>> GetActiveDowntimes(string? lineName = null, CancellationToken cancellationToken = default)
        {
            var query = _database.Downtimes
                .AsNoTracking()
                .Include(d => d.ProductionReport)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(lineName))
            {
                query = query.Where(d => d.ProductionReport != null && d.ProductionReport.LineName == lineName);
            }

            var downtimes = await query
                .OrderByDescending(d => d.StartTime)
                .ToListAsync();

            var result = downtimes.Select(d => new ActiveDowntimeDto(
                Id: d.Id,
                StartTime: d.StartTime,
                EndTime: d.EndTime,
                Type: d.Type,
                Reason: d.Reason,
                LineName: d.ProductionReport?.LineName ?? string.Empty,
                EquipmentName: d.ProductionReport?.EquipmentName ?? string.Empty,
                Duration: (int)Math.Max(0, (d.EndTime - d.StartTime).TotalMinutes)
            )).ToList();

            return result;
        }

        public async Task<List<EquipmentStatusDto>> GetEquipmentStatus(string? lineName = null, CancellationToken cancellationToken = default)
        {
            var query = _database.ProductionReports.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(lineName))
            {
                query = query.Where(e => e.LineName == lineName);
            }

            var equipments = await query
                .Include(e => e.Downtimes)
                .ToListAsync(cancellationToken);

            var result = equipments
                .GroupBy(e => new { e.EquipmentName, e.LineName })
                .Select(g =>
                {
                    var totalProduction = g.Sum(e => e.GoodCount + e.ScrapCount);
                    var totalHours = g.Select(e => e.Date).Distinct().Count();
                    var actualRate = totalHours > 0 ? totalProduction / totalHours : totalProduction;
                    var targetRate = 83;
                    
                    var equipmentId = string.IsNullOrWhiteSpace(g.Key.EquipmentName) 
                        ? Guid.NewGuid().ToString() 
                        : g.Key.EquipmentName.Replace(" ", "-").ToUpperInvariant();
                    
                    return new EquipmentStatusDto(
                        Id: equipmentId,
                        Name: g.Key.EquipmentName,
                        Status: DetermineStatus(g.ToList()),
                        ActualProductionRate: actualRate,
                        TargetProductionRate: targetRate,
                        EfficiencyPercentage: CalculateEfficiency(actualRate, targetRate)
                    );
                })
                .Where(e => !string.IsNullOrWhiteSpace(e.Name))
                .ToList();

            return result;
        }

        private static string DetermineStatus(List<ProductionReport> reports)
        {
            var hasActiveDowntime = reports.Any(r => 
                r.Downtimes.Any(d => d.EndTime == DateTime.MinValue || 
                               (DateTime.UtcNow - d.EndTime).TotalHours < 1));
            
            if (hasActiveDowntime)
            {
                var hasMaintenanceDowntime = reports.Any(r => 
                    r.Downtimes.Any(d => d.Type.Contains("Maintenance", StringComparison.OrdinalIgnoreCase)));
                
                if (hasMaintenanceDowntime)
                    return "maintenance";
                
                var hasBreakdown = reports.Any(r => 
                    r.Downtimes.Any(d => d.Type.Contains("Breakdown", StringComparison.OrdinalIgnoreCase)));
                
                if (hasBreakdown)
                    return "error";
                
                return "idle";
            }
            
            var hasRecentProduction = reports.Any(r => 
                (DateTime.UtcNow - r.Date).TotalHours < 24 && (r.GoodCount + r.ScrapCount) > 0);
            
            return hasRecentProduction ? "running" : "idle";
        }

        private static int CalculateEfficiency(int actualRate, int targetRate)
        {
            return targetRate == 0 ? 0 : (int)Math.Round((double)actualRate * 100.0 / targetRate);
        }
    }
}
