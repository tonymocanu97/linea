using Linea.Application.DTOs.Insights;
using Linea.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Linea.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsightsController : ControllerBase
    {
        private readonly IInsightsService _insightsService;

        public InsightsController(IInsightsService insightsService)
        {
            _insightsService = insightsService;
        }

        [HttpPost("ask")]
        public async Task<ActionResult<InsightsResponse>> Ask([FromBody] InsightsRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new { error = "Question is required." });
            }

            DateOnly? from = null;
            DateOnly? to = null;
            if (request.From.HasValue)
                from = DateOnly.FromDateTime(request.From.Value.Date);
            if (request.To.HasValue)
                to = DateOnly.FromDateTime(request.To.Value.Date);

            try
            {
                var response = await _insightsService.AskAsync(
                    request.Question,
                    from,
                    to,
                    request.LineName,
                    cancellationToken);
                return Ok(new InsightsResponse { Answer = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
