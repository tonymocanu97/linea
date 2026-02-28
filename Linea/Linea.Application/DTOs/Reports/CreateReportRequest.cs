using Linea.Domain.Enums;

namespace Linea.Application.DTOs.Reports
{
    public sealed record CreateReportRequest
    (
        DateTime Date,
        ShiftType Shift,
        string LineName,
        Guid EquipmentId,
        int GoodCount,
        int ScrapCount,
        string? Notes
    );
}
