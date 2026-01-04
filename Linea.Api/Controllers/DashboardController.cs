using Linea.Application.DTOs.Dashboard;
using Linea.Application.Interfaces;
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
    }
}
