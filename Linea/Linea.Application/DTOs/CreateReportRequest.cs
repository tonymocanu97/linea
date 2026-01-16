using Linea.Domain.Enums;

namespace Linea.Application.DTOs
{
    public sealed record CreateReportRequest
    (
        DateTime Date,
        ShiftType Shift,
        string LineName,
        string EquipmentName,
        int GoodCount,
        int ScrapCount,
        string? Notes
    );
}
