using Linea.Application.DTOs;
using Linea.Application.DTOs.Dashboard;
using Linea.Application.Interfaces;
using Linea.Domain.Entities;
using Linea.Domain.Enums;
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

            var fromDateTime = from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var toDateTime = to.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
            
            var downtimeQuery = _database.Downtimes.AsNoTracking()
                .Include(d => d.ProductionReport)
                .ThenInclude(p => p.Equipment)
                .AsQueryable();

            downtimeQuery = downtimeQuery.Where(d => 
                (d.EndTime == null || d.EndTime >= fromDateTime) && 
                d.StartTime <= toDateTime);

            if (!string.IsNullOrWhiteSpace(lineName))
            {
                downtimeQuery = downtimeQuery.Where(d => 
                    d.ProductionReport != null && 
                    d.ProductionReport.LineName == lineName.Trim());
            }

            var downtimes = await downtimeQuery.ToListAsync(cancellationToken);
            
            var totalDowntime = 0;
            foreach (var downtime in downtimes)
            {
                var startTime = downtime.StartTime < fromDateTime ? fromDateTime : downtime.StartTime;
                var endTime = downtime.EndTime ?? DateTime.UtcNow;
                endTime = endTime > toDateTime ? toDateTime : endTime;
                
                if (endTime > startTime)
                {
                    totalDowntime += (int)Math.Max(0, (endTime - startTime).TotalMinutes);
                }
            }

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
                TotalDowntimeMinutes: totalDowntime,
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
                .ThenInclude(p => p.Equipment)
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
                EquipmentName: d.ProductionReport?.Equipment?.Name ?? string.Empty,
                Duration: (int)Math.Max(0, ((d.EndTime ?? DateTime.UtcNow) - d.StartTime).TotalMinutes)
            )).ToList();

            return result;
        }

        public async Task<List<ActiveDowntimeDto>> GetDowntimes(DateOnly from, DateOnly to, string? lineName = null, CancellationToken cancellationToken = default)
        {
            if (to < from)
            {
                throw new ArgumentException("'to' date must be greater than or equal to 'from' date.");
            }

            var fromDateTime = from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var toDateTime = to.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

            var query = _database.Downtimes
                .AsNoTracking()
                .Include(d => d.ProductionReport)
                .ThenInclude(p => p.Equipment)
                .AsQueryable();

            query = query.Where(d => 
                (d.EndTime == null || d.EndTime >= fromDateTime) && 
                d.StartTime <= toDateTime);

            if (!string.IsNullOrWhiteSpace(lineName))
            {
                query = query.Where(d => d.ProductionReport != null && d.ProductionReport.LineName == lineName.Trim());
            }

            var downtimes = await query
                .OrderByDescending(d => d.StartTime)
                .ToListAsync(cancellationToken);

            var result = downtimes.Select(d => new ActiveDowntimeDto(
                Id: d.Id,
                StartTime: d.StartTime,
                EndTime: d.EndTime,
                Type: d.Type,
                Reason: d.Reason,
                LineName: d.ProductionReport?.LineName ?? string.Empty,
                EquipmentName: d.ProductionReport?.Equipment?.Name ?? string.Empty,
                Duration: (int)Math.Max(0, ((d.EndTime ?? DateTime.UtcNow) - d.StartTime).TotalMinutes)
            )).ToList();

            return result;
        }

        public async Task<List<EquipmentStatusDto>> GetEquipmentStatus(string? lineName = null, CancellationToken cancellationToken = default)
        {
            var query = _database.Equipment.AsNoTracking().AsQueryable();

            var equipmentWithReports = await query
                .Include(e => e.ProductionReports)
                .ToListAsync(cancellationToken);

            var now = DateTime.UtcNow;
            var currentShift = GetCurrentShift(now);
            var todayStart = now.Date;

            var result = equipmentWithReports
                .Select(e =>
                {
                    var reports = e.ProductionReports
                        .Where(r => r.Date >= todayStart && r.Date < todayStart.AddDays(1) && r.Shift == currentShift)
                        .ToList();

                    if (!string.IsNullOrWhiteSpace(lineName))
                    {
                        reports = reports.Where(r => r.LineName == lineName).ToList();
                    }

                    var actualProduction = reports.Sum(r => r.GoodCount + r.ScrapCount);
                    var target = e.TargetProductionRate > 0 ? e.TargetProductionRate : 40000;
                    var efficiency = (int)Math.Round((double)actualProduction * 100.0 / target);

                    return new EquipmentStatusDto(
                        Id: e.Id.ToString(),
                        Name: e.Name,
                        Status: e.Status,
                        ActualProductionRate: actualProduction,
                        TargetProductionRate: e.TargetProductionRate > 0 ? e.TargetProductionRate : target,
                        EfficiencyPercentage: efficiency
                    );
                })
                .ToList();

            return result;
        }

        private static ShiftType GetCurrentShift(DateTime utcNow)
        {
            var hour = utcNow.Hour;
            if (hour < 8) return ShiftType.Shift1;
            if (hour < 16) return ShiftType.Shift2;
            return ShiftType.Shift3;
        }

        public async Task<EquipmentDto> AddEquipmentAsync(CreateEquipmentDto equipment, CancellationToken cancellationToken = default)
        {
            var newEquipment = new Equipment
            {
                Name = equipment.Name,
                Status = equipment.Status,
                TargetProductionRate = equipment.TargetProductionRate,
                Notes = equipment.Notes
            };

            _database.Equipment.Add(newEquipment);
            await _database.SaveChangesAsync(cancellationToken);

            return new EquipmentDto(
                Id: newEquipment.Id,
                Name: newEquipment.Name,
                Status: newEquipment.Status,
                TargetProductionRate: newEquipment.TargetProductionRate,
                Notes: newEquipment.Notes
            );
        }

        public async Task<EquipmentDto> UpdateEquipmentAsync(Guid id, UpdateEquipmentDto equipment, CancellationToken cancellationToken = default)
        {
            var existingEquipment = await _database.Equipment.FindAsync(new object[] { id }, cancellationToken: cancellationToken);

            if (existingEquipment == null)
            {
                throw new KeyNotFoundException($"Equipment with id {id} not found.");
            }

            if (!string.IsNullOrWhiteSpace(equipment.Name))
            {
                existingEquipment.Name = equipment.Name;
            }

            if (!string.IsNullOrWhiteSpace(equipment.Status))
            {
                existingEquipment.Status = equipment.Status;
            }

            if (equipment.TargetProductionRate.HasValue)
            {
                existingEquipment.TargetProductionRate = equipment.TargetProductionRate.Value;
            }

            if (equipment.Notes != null)
            {
                existingEquipment.Notes = equipment.Notes;
            }

            _database.Equipment.Update(existingEquipment);
            await _database.SaveChangesAsync(cancellationToken);

            return new EquipmentDto(
                Id: existingEquipment.Id,
                Name: existingEquipment.Name,
                Status: existingEquipment.Status,
                TargetProductionRate: existingEquipment.TargetProductionRate,
                Notes: existingEquipment.Notes
            );
        }

        public async Task<EquipmentDto> SetMaintenanceModeAsync(Guid id, SetMaintenanceModeDto request, CancellationToken cancellationToken = default)
        {
            var equipment = await _database.Equipment.FindAsync(new object[] { id }, cancellationToken: cancellationToken);

            if (equipment == null)
            {
                throw new KeyNotFoundException($"Equipment with id {id} not found.");
            }

            equipment.Status = "Maintenance";
            equipment.Notes = $"Maintenance: {request.Reason}";

            _database.Equipment.Update(equipment);
            await _database.SaveChangesAsync(cancellationToken);

            return new EquipmentDto(
                Id: equipment.Id,
                Name: equipment.Name,
                Status: equipment.Status,
                TargetProductionRate: equipment.TargetProductionRate,
                Notes: equipment.Notes
            );
        }

        public async Task DeleteEquipmentAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var equipment = await _database.Equipment.FindAsync(new object[] { id }, cancellationToken: cancellationToken);

            if (equipment == null)
            {
                throw new KeyNotFoundException($"Equipment with id {id} not found.");
            }

            _database.Equipment.Remove(equipment);
            await _database.SaveChangesAsync(cancellationToken);
        }
    }
}
