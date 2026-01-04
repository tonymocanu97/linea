using Linea.Domain.Entities;
using Linea.Domain.Enums;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Linea.Infrastructure.Services
{
    public sealed class TelemetrySimulatorService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly Random _rng = new();

        private static readonly string[] Lines = new[]
        {
            "Line A",
            "Line B",
            "Line C"
        };

        private static readonly string[] DefectTypes = new[]
        {
            "Misalignment",
            "Surface Defect",
            "Dimension Out of Spec",
            "Color Variation",
            "Material Flaw"
        };

        private static readonly string[] DowntimeReasons = new[]
        {
            "Machine Maintenance",
            "Material Shortage",
            "Quality Inspection",
            "Operator Break",
            "Unplanned Repair"
        };

        public TelemetrySimulatorService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await SimulateTick(stoppingToken);
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }

        private async Task SimulateTick(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var database = scope.ServiceProvider.GetRequiredService<LineaDbContext>();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var shift = GetCurrentShiftUtc(DateTime.UtcNow);

            foreach (var lineName in Lines)
            {
                var report = await database.ProductionReports
                    .FirstOrDefaultAsync(r => r.Date == today && r.Shift == shift && r.LineName == lineName, cancellationToken);

                if (report == null)
                {
                    report = new ProductionReport
                    {
                        Date = today,
                        Shift = shift,
                        LineName = lineName,
                        GoodCount = 0,
                        ScrapCount = 0,
                        Notes = "Auto-generated report"
                    };
                    database.ProductionReports.Add(report);
                    await database.SaveChangesAsync(cancellationToken);
                }

                report.GoodCount += lineName switch
                {
                    "Line A" => _rng.Next(10, 35),
                    "Line B" => _rng.Next(7, 28),
                    "Line C" => _rng.Next(5, 22),
                    _ => _rng.Next(5, 20)
                };

                report.ScrapCount += _rng.NextDouble() < 0.7 ? _rng.Next(0, 3) : _rng.Next(0, 6);

                if (_rng.NextDouble() < 0.25)
                {
                    var defect = new Defect
                    {
                        ProductionReportId = report.Id,
                        Type = DefectTypes[_rng.Next(DefectTypes.Length)],
                        Quantity = _rng.Next(1, 6),
                        Comment = $"Simulated defect on {lineName}"
                    };
                    database.Defects.Add(defect);
                }

                if (_rng.NextDouble() < 0.15)
                {
                    var downtime = new Downtime
                    {
                        ProductionReportId = report.Id,
                        StartTime = DateTime.UtcNow.AddMinutes(-_rng.Next(2, 15)),
                        EndTime = DateTime.UtcNow,
                        Reason = DowntimeReasons[_rng.Next(DowntimeReasons.Length)],
                    };
                    database.Downtimes.Add(downtime);
                }

                await database.SaveChangesAsync(cancellationToken);
            }

        }

        private static ShiftType GetCurrentShiftUtc(DateTime utcNow)
        {
            var hour = utcNow.Hour;
            if (hour < 8)
                return ShiftType.Shift1;
            else if (hour < 16)
                return ShiftType.Shift2;
            else
                return ShiftType.Shift3;
        }
    }
}
