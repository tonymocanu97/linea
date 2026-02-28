using System;

namespace Linea.Application.DTOs.Insights
{
    public sealed record InsightsResponse
    {
        public string Answer { get; init; } = string.Empty;
    }
}
