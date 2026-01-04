using Linea.Domain.Enums;

namespace Linea.Application.DTOs
{
    public sealed record CreateReportRequest
    (
        DateOnly Date,
        ShiftType Shift,
        string LineName,
        int GoodCount,
        int ScrapCount,
        string? Notes
    );
}
