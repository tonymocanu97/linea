using Linea.Application.DTOs.GeneratedReports;
using Linea.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Linea.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeneratedReportsController : ControllerBase
    {
        private readonly IGeneratedReportService _service;

        public GeneratedReportsController(IGeneratedReportService service) => _service = service;

        [HttpPost]
        public async Task<ActionResult<GeneratedReportResponse>> Create([FromBody] CreateGeneratedReportRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<GeneratedReportResponse>>> GetAll(CancellationToken cancellationToken)
        {
            var list = await _service.GetAllAsync(cancellationToken);
            return Ok(list);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GeneratedReportResponse>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var report = await _service.GetByIdAsync(id, cancellationToken);
            return report is null ? NotFound() : Ok(report);
        }

        [HttpGet("{id:guid}/download")]
        public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var csvContent = await _service.DownloadAsync(id, cancellationToken);
                var fileName = $"report-{DateTime.UtcNow:yyyy-MM-dd-HHmmss}.csv";
                return File(csvContent, "text/csv", fileName);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
