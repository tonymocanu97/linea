using Linea.Application.DTOs;
using Linea.Application.Interfaces;
using Linea.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Linea.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportsController(IReportService service) => _service = service;

        [HttpPost]
        public async Task<ActionResult<ReportDto>> Create([FromBody] CreateReportRequest request, CancellationToken cancellationToken)
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
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ReportDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var report = await _service.GetByIdAsync(id, cancellationToken);
            return report is null ? NotFound() : Ok(report);
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ReportDto>>> Get([FromQuery] DateTime? date, [FromQuery] ShiftType shift, [FromQuery] string? lineName, [FromQuery] string? equipment, CancellationToken cancellationToken)
        {
            var list = await _service.GetAsync(date, shift, lineName, equipment, cancellationToken);
            return Ok(list);
        }

        [HttpPost("{id:guid}/defects")]
        public async Task<ActionResult<ReportDto>> AddDefect(Guid id, [FromBody] AddDefectRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var updated = await _service.AddDefectAsync(id, request, cancellationToken);
                return updated is null ? NotFound() : Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id:guid}/downtimes")]
        public async Task<ActionResult<ReportDto>> AddDowntime(Guid id, [FromBody] AddDowntimeRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var updated = await _service.AddDowntimeAsync(id, request, cancellationToken);
                return updated is null ? NotFound() : Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
