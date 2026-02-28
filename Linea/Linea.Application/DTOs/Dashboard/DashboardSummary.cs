using System;

namespace Linea.Application.DTOs.Dashboard
{
    public sealed record TopDefectSummary(string Type, int Quantity);

    public sealed record DashboardSummary
    (
        DateOnly From,
        DateOnly To,
        string? LineName,
        int TotalGood,
        int TotalScrap,
        decimal ScrapRatePercent,
        int TotalDowntimeMinutes,
        IReadOnlyList<TopDefectSummary> TopDefects
    );
}
