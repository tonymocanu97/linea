using Linea.Domain.Enums;

namespace Linea.Application.DTOs
{
    public sealed record DefectDto
    (
        Guid Id,
        string Type,
        int Quantity,
        string? Comment
    );

    public sealed record DowntimeDto
    (
        Guid Id,
        DateTime StartTime,
        DateTime EndTime,
        string Reason,
        int Duration
    );

    public sealed record ReportDto
    (
        Guid Id,
        DateOnly Date,
        ShiftType Shift,
        string LineName,
        int GoodCount,
        int ScrapCount,
        string? Notes,
        IReadOnlyList<DefectDto> Defects,
        IReadOnlyList<DowntimeDto> Downtimes
    );
}
