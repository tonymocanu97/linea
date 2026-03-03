using Linea.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Linea.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TelemetryController : ControllerBase
    {
        private readonly ITelemetryDataGenerator _generator;

        public TelemetryController(ITelemetryDataGenerator generator)
        {
            _generator = generator;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateData(CancellationToken cancellationToken)
        {
            await _generator.GenerateTickAsync(cancellationToken);
            return Ok(new { message = "Data generated successfully" });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetData(CancellationToken cancellationToken)
        {
            await _generator.ResetDataAsync(cancellationToken);
            return Ok(new { message = "Data reset successfully" });
        }
    }
}
