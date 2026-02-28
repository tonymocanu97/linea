using Linea.Domain.Enums;

namespace Linea.Application.DTOs.GeneratedReports
{
    public sealed record CreateGeneratedReportRequest
    (
        DateTime? Date,
        ShiftType? Shift,
        string? LineName,
        Guid? EquipmentId
    );
}
