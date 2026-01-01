using Linea.Domain.Entities;
using Linea.Domain.Enums;
using Linea.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Linea.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly LineaDbContext _db;

        public ReportsController(LineaDbContext db) => _db = db;

        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            var report = new ProductionReport
            {
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Shift = ShiftType.Shift1,
                LineName = "Linea A",
                GoodCount = 1200,
                ScrapCount = 23,
                Notes = "First seeded report"
            };

            report.Defects.Add(new Defect { Type = "Scratch", Quantity = 10 });
            report.Downtimes.Add(new Downtime
            {
                StartTime = DateTime.UtcNow.AddMinutes(-30),
                EndTime = DateTime.UtcNow.AddMinutes(-10),
                Reason = "Material change"
            });

            _db.ProductionReports.Add(report);
            await _db.SaveChangesAsync();

            return Ok(new { report.Id });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _db.ProductionReports
                .Include(x => x.Defects)
                .Include(x => x.Downtimes)
                .OrderByDescending(x => x.Date)
                .ToListAsync();

            return Ok(data);
        }
    }
}
