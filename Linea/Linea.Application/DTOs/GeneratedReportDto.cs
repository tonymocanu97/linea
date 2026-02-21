using Linea.Domain.Enums;

namespace Linea.Application.DTOs
{
    public sealed record GeneratedReportDto
    (
        Guid Id,
        DateTime CreatedAt,
        DateTime? DateFilter,
        ShiftType? ShiftFilter,
        string? LineNameFilter,
        Guid? EquipmentIdFilter,
        string? EquipmentName
    );

    public sealed record CreateGeneratedReportRequest
    (
        DateTime? Date,
        ShiftType? Shift,
        string? LineName,
        Guid? EquipmentId
    );
}
