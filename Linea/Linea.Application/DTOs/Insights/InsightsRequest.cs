using System;

namespace Linea.Application.DTOs.Insights
{
    public sealed record InsightsRequest
    {
        public string Question { get; init; } = string.Empty;
        public DateTime? From { get; init; }
        public DateTime? To { get; init; }
        public string? LineName { get; init; }
    }
}
