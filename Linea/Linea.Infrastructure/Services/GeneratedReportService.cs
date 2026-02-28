using Linea.Application.DTOs.GeneratedReports;
using Linea.Application.Interfaces;
using Linea.Domain.Entities.GeneratedReports;
using Linea.Domain.Entities.Reports;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Linea.Infrastructure.Services
{
    public sealed class GeneratedReportService : IGeneratedReportService
    {
        private readonly LineaDbContext _database;

        public GeneratedReportService(LineaDbContext database)
        {
            _database = database;
        }

        public async Task<GeneratedReportResponse> CreateAsync(CreateGeneratedReportRequest request, CancellationToken cancellationToken = default)
        {
            string? equipmentName = null;
            if (request.EquipmentId.HasValue)
            {
                var equipment = await _database.Equipment
                    .FirstOrDefaultAsync(e => e.Id == request.EquipmentId.Value, cancellationToken);
                equipmentName = equipment?.Name;
            }

            var entity = new GeneratedReport
            {
                DateFilter = request.Date.HasValue 
                    ? (request.Date.Value.Kind == DateTimeKind.Unspecified 
                        ? DateTime.SpecifyKind(request.Date.Value, DateTimeKind.Utc) 
                        : request.Date.Value.ToUniversalTime())
                    : null,
                ShiftFilter = request.Shift,
                LineNameFilter = request.LineName,
                EquipmentIdFilter = request.EquipmentId,
                EquipmentName = equipmentName
            };

            _database.GeneratedReports.Add(entity);
            await _database.SaveChangesAsync(cancellationToken);

            return Map(entity);
        }

        public async Task<IReadOnlyList<GeneratedReportResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var list = await _database.GeneratedReports
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);

            return list.Select(Map).ToList();
        }

        public async Task<GeneratedReportResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _database.GeneratedReports
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            return entity is null ? null : Map(entity);
        }

        public async Task<byte[]> DownloadAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var generatedReport = await _database.GeneratedReports
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (generatedReport is null)
                throw new KeyNotFoundException($"Generated report with ID {id} not found.");

            var query = _database.ProductionReports
                .Include(x => x.Equipment)
                .Include(x => x.Defects)
                .Include(x => x.Downtimes)
                .AsQueryable();

            if (generatedReport.DateFilter.HasValue)
            {
                var dateUtc = generatedReport.DateFilter.Value;
                query = query.Where(x => x.Date.Date == dateUtc.Date);
            }

            if (generatedReport.ShiftFilter.HasValue)
                query = query.Where(x => x.Shift == generatedReport.ShiftFilter.Value);

            if (!string.IsNullOrWhiteSpace(generatedReport.LineNameFilter))
                query = query.Where(x => x.LineName == generatedReport.LineNameFilter);

            if (generatedReport.EquipmentIdFilter.HasValue)
                query = query.Where(x => x.EquipmentId == generatedReport.EquipmentIdFilter.Value);

            var productionReports = await query.ToListAsync(cancellationToken);

            var totalGood = productionReports.Sum(r => r.GoodCount);
            var totalScrap = productionReports.Sum(r => r.ScrapCount);
            var allDefects = productionReports.SelectMany(r => r.Defects).ToList();
            var allDowntimes = productionReports.SelectMany(r => r.Downtimes).ToList();

            return GenerateCsv(generatedReport, totalGood, totalScrap, allDefects, allDowntimes, productionReports.Count);
        }

        private byte[] GenerateCsv(GeneratedReport report, int totalGood, int totalScrap, 
            List<Defect> defects, List<Downtime> downtimes, int recordCount)
        {
            var scrapRate = totalGood + totalScrap > 0 
                ? (totalScrap * 100.0 / (totalGood + totalScrap)).ToString("F1") 
                : "0";

            var content = new StringBuilder();
            
            content.AppendLine("PRODUCTION REPORT (AGGREGATED)");
            content.AppendLine($"Generated At,{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            content.AppendLine($"Date Filter,{(report.DateFilter.HasValue ? report.DateFilter.Value.ToString("yyyy-MM-dd") : "All")}");
            content.AppendLine($"Shift Filter,{(report.ShiftFilter.HasValue ? $"Shift {report.ShiftFilter.Value}" : "All")}");
            content.AppendLine($"Line Filter,{report.LineNameFilter ?? "All"}");
            content.AppendLine($"Equipment Filter,{report.EquipmentName ?? "All"}");
            content.AppendLine($"Records Aggregated,{recordCount}");
            content.AppendLine();
            
            content.AppendLine("PRODUCTION SUMMARY");
            content.AppendLine("Metric,Value");
            content.AppendLine($"Good Count,{totalGood}");
            content.AppendLine($"Scrap Count,{totalScrap}");
            content.AppendLine($"Total,{totalGood + totalScrap}");
            content.AppendLine($"Scrap Rate,{scrapRate}%");
            content.AppendLine();
            
            if (defects.Any())
            {
                content.AppendLine("DEFECTS");
                content.AppendLine("Type,Quantity,Comment");
                foreach (var defect in defects)
                {
                    content.AppendLine($"\"{defect.Type}\",{defect.Quantity},\"{defect.Comment ?? ""}\"");
                }
                content.AppendLine();
            }
            
            if (downtimes.Any())
            {
                content.AppendLine("DOWNTIMES");
                content.AppendLine("Type,Reason,Duration (min),Start Time,End Time");
                foreach (var downtime in downtimes)
                {
                    var duration = (int)Math.Max(0, ((downtime.EndTime ?? DateTime.UtcNow) - downtime.StartTime).TotalMinutes);
                    content.AppendLine($"\"{downtime.Type}\",\"{downtime.Reason}\",{duration},{downtime.StartTime:yyyy-MM-dd HH:mm},{downtime.EndTime:yyyy-MM-dd HH:mm}");
                }
                content.AppendLine();
            }

            return Encoding.UTF8.GetBytes(content.ToString());
        }

        private GeneratedReportResponse Map(GeneratedReport entity)
        {
            return new GeneratedReportResponse(
                entity.Id,
                entity.CreatedAt,
                entity.DateFilter,
                entity.ShiftFilter,
                entity.LineNameFilter,
                entity.EquipmentIdFilter,
                entity.EquipmentName
            );
        }
    }
}
