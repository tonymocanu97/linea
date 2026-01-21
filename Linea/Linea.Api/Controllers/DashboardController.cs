using Linea.Application.DTOs;
using Linea.Application.DTOs.Dashboard;
using Linea.Application.Interfaces;
using Linea.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Linea.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardservice _dashboardService;

        public DashboardController(IDashboardservice dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummary>> GetSummary([FromQuery] DateOnly from, [FromQuery] DateOnly to, [FromQuery] string? lineName, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _dashboardService.GetSummaryAsync(from, to, lineName, cancellationToken);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("hourly")]
        public async Task<ActionResult<List<HourlyProductionPoint>>> GetHourlyProduction([FromQuery] DateOnly from, [FromQuery] DateOnly to, [FromQuery] string? lineName, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _dashboardService.GetHourlyProduction(from, to, lineName, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpGet("active-downtimes")]
        public async Task<ActionResult<List<ActiveDowntimeDto>>> GetActiveDowntimes([FromQuery] string? lineName, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _dashboardService.GetActiveDowntimes(lineName, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("equipment-status")]
        public async Task<ActionResult<List<EquipmentStatusDto>>> GetEquipmentStatus([FromQuery] string? lineName, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _dashboardService.GetEquipmentStatus(lineName, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
