using Linea.Application.Interfaces;
using Linea.Domain.Entities.Reports;
using Linea.Domain.Enums;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Linea.Infrastructure.Services
{
    public sealed class TelemetryDataGeneratorService : ITelemetryDataGenerator
    {
        private readonly LineaDbContext _database;
        private readonly Random _rng = new();

        private static readonly string[] Lines = { "Line A", "Line B", "Line C" };
        private static readonly string[] DefectTypes = { "Misalignment", "Surface Defect", "Dimension Out of Spec", "Color Variation", "Material Flaw" };
        private static readonly string[] DowntimeReasons = { "Machine Maintenance", "Material Shortage", "Quality Inspection", "Operator Break", "Unplanned Repair" };

        public TelemetryDataGeneratorService(LineaDbContext database)
        {
            _database = database;
        }

        public async Task GenerateTickAsync(CancellationToken cancellationToken = default)
        {
            var equipmentList = await _database.Equipment.ToListAsync(cancellationToken);
            if (equipmentList.Count == 0)
                return;

            var now = DateTime.UtcNow;
            var todayDate = DateTime.SpecifyKind(now.Date, DateTimeKind.Utc);
            var shift = GetCurrentShiftUtc(now);

            foreach (var equipment in equipmentList)
            {
                foreach (var lineName in Lines)
                {
                    var report = await _database.ProductionReports
                        .FirstOrDefaultAsync(r => r.Date == todayDate && r.Shift == shift && r.LineName == lineName && r.EquipmentId == equipment.Id, cancellationToken);

                    if (report == null)
                    {
                        report = new ProductionReport
                        {
                            Date = todayDate,
                            Shift = shift,
                            LineName = lineName,
                            EquipmentId = equipment.Id,
                            GoodCount = 0,
                            ScrapCount = 0,
                            Notes = "Auto-generated report"
                        };
                        _database.ProductionReports.Add(report);
                        await _database.SaveChangesAsync(cancellationToken);
                    }

                    var good = _rng.Next(60, 140);
                    var scrap = _rng.Next(10, 40);
                    report.GoodCount += good;
                    report.ScrapCount += scrap;

                    if (_rng.NextDouble() < 0.25)
                    {
                        _database.Defects.Add(new Defect
                        {
                            ProductionReportId = report.Id,
                            Type = DefectTypes[_rng.Next(DefectTypes.Length)],
                            Quantity = _rng.Next(1, 6),
                            Comment = $"Simulated defect on {lineName}"
                        });
                    }

                    if (_rng.NextDouble() < 0.15)
                    {
                        var reason = DowntimeReasons[_rng.Next(DowntimeReasons.Length)];
                        var isOpenAlert = _rng.NextDouble() < 0.4;
                        _database.Downtimes.Add(new Downtime
                        {
                            ProductionReportId = report.Id,
                            StartTime = DateTime.UtcNow.AddMinutes(-_rng.Next(2, 15)),
                            EndTime = isOpenAlert ? null : DateTime.UtcNow,
                            Type = reason.Contains("Repair") ? "Breakdown" : reason.Contains("Maintenance") ? "Planned Maintenance" : "Other",
                            Reason = reason,
                        });
                    }

                    await _database.SaveChangesAsync(cancellationToken);
                }
            }
        }

        public async Task ResetDataAsync(CancellationToken cancellationToken = default)
        {
            await _database.ProductionReports.ExecuteDeleteAsync(cancellationToken);
        }

        private static ShiftType GetCurrentShiftUtc(DateTime utcNow)
        {
            var hour = utcNow.Hour;
            if (hour < 8) return ShiftType.Shift1;
            if (hour < 16) return ShiftType.Shift2;
            return ShiftType.Shift3;
        }
    }
}
