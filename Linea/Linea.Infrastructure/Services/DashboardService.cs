using Linea.Application.DTOs.Dashboard;
using Linea.Application.Interfaces;
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
            query = query.Where(r => r.Date >= from && r.Date <= to);

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
    }
}
