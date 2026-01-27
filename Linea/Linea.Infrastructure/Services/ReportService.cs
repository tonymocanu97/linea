using Linea.Application.DTOs;
using Linea.Application.Interfaces;
using Linea.Domain.Entities;
using Linea.Domain.Enums;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Linea.Infrastructure.Services
{
    public sealed class ReportService : IReportService
    {
        private readonly LineaDbContext _database;

        public ReportService(LineaDbContext database)
        {
            _database = database;
        }

        public async Task<ReportDto> CreateAsync(CreateReportRequest request, CancellationToken cancellationToken = default)
        {
            ValidateCreate(request);

            var exists = await _database.ProductionReports.AnyAsync(x =>
                x.Date == request.Date &&
                x.Shift == request.Shift &&
                x.LineName == request.LineName &&
                x.EquipmentName == request.EquipmentName, cancellationToken);

            if (exists)
                throw new InvalidOperationException("A report for this date/shift/line already exists.");

            var entity = new ProductionReport
            {
                Date = request.Date,
                Shift = request.Shift,
                LineName = request.LineName.Trim(),
                EquipmentName = request.EquipmentName.Trim(),
                GoodCount = request.GoodCount,
                ScrapCount = request.ScrapCount,
                Notes = request.Notes
            };

            _database.ProductionReports.Add(entity);
            await _database.SaveChangesAsync(cancellationToken);

            await _database.Entry(entity).Collection(x => x.Defects).LoadAsync(cancellationToken);
            await _database.Entry(entity).Collection(x => x.Downtimes).LoadAsync(cancellationToken);

            return Map(entity);
        }

        public async Task<ReportDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _database.ProductionReports
                .Include(x => x.Defects)
                .Include(x => x.Downtimes)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            return entity is null ? null : Map(entity);
        }

        public async Task<IReadOnlyList<ReportDto>> GetAsync(
        DateTime? date,
        ShiftType? shift,
        string? lineName,
        string? equipmentName,
        CancellationToken cancellationToken = default)
        {
            var q = _database.ProductionReports
                .AsNoTracking()
                .Include(x => x.Defects)
                .Include(x => x.Downtimes)
                .AsQueryable();

            if (date is not null)
                q = q.Where(x => x.Date == date);

            if (shift is not null)
                q = q.Where(x => x.Shift == shift);

            if (!string.IsNullOrWhiteSpace(lineName))
                q = q.Where(x => x.LineName == lineName.Trim());

            if (!string.IsNullOrWhiteSpace(equipmentName))
                q = q.Where(x => x.EquipmentName == equipmentName.Trim());

            var list = await q
                .OrderByDescending(x => x.Date)
                .ThenByDescending(x => x.Shift)
                .ThenBy(x => x.LineName)
                .ThenBy(x => x.EquipmentName)
                .ToListAsync(cancellationToken);

            return list.Select(Map).ToList();
        }

        public async Task<ReportDto?> AddDefectAsync(Guid reportId, AddDefectRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDefect(request);

            var report = await _database.ProductionReports
                .Include(x => x.Defects)
                .Include(x => x.Downtimes)
                .FirstOrDefaultAsync(x => x.Id == reportId, cancellationToken);

            if (report is null) return null;

            _database.Defects.Add(new Defect
            {
                ProductionReportId = reportId,
                Type = request.Type.Trim(),
                Quantity = request.Quantity,
                Comment = request.Comment
            });

            await _database.SaveChangesAsync(cancellationToken);
            return Map(report);
        }

        public async Task<ReportDto?> AddDowntimeAsync(Guid reportId, AddDowntimeRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDowntime(request);

            var report = await _database.ProductionReports
                .Include(x => x.Defects)
                .Include(x => x.Downtimes)
                .FirstOrDefaultAsync(x => x.Id == reportId, cancellationToken);

            if (report is null) return null;

            _database.Downtimes.Add(new Downtime
            {
                ProductionReportId = reportId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Type = request.Type.Trim(),
                Reason = request.Reason.Trim()
            });

            await _database.SaveChangesAsync(cancellationToken);
            return Map(report);
        }

        private void ValidateCreate(CreateReportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.LineName))
                throw new ArgumentException("LineName is required.");

            if (string.IsNullOrWhiteSpace(request.EquipmentName))
                throw new ArgumentException("EquipmentName is required.");

            if (request.GoodCount < 0 || request.ScrapCount < 0)
                throw new ArgumentException("GoodCount/ScrapCount must be >= 0.");
        }

        private void ValidateDefect(AddDefectRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Type))
                throw new ArgumentException("Defect type is required.");
            if (request.Quantity <= 0)
                throw new ArgumentException("Quantity must be > 0.");
        }

        private void ValidateDowntime(AddDowntimeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Type))
                throw new ArgumentException("Type is required.");
            if (string.IsNullOrWhiteSpace(request.Reason))
                throw new ArgumentException("Reason is required.");
            if (request.EndTime <= request.StartTime)
                throw new ArgumentException("EndUtc must be after StartUtc.");
        }

        private ReportDto Map(ProductionReport report)
        {
            var defects = report.Defects
            .Select(d => new DefectDto(d.Id, d.Type, d.Quantity, d.Comment))
            .ToList();

            var downtimes = report.Downtimes
                .Select(d => new DowntimeDto(
                    d.Id,
                    d.StartTime,
                    d.EndTime,
                    d.Type,
                    d.Reason,
                    (int)Math.Max(0, (d.EndTime - d.StartTime).TotalMinutes)))
                .ToList();

            return new ReportDto(
                report.Id,
                report.Date,
                report.Shift,
                report.LineName,
                report.EquipmentName,
                report.GoodCount,
                report.ScrapCount,
                report.Notes,
                defects,
                downtimes
            );
        }
    }
}
