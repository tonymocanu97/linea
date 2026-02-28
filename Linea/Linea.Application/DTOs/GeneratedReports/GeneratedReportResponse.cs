using Linea.Domain.Enums;

namespace Linea.Application.DTOs.GeneratedReports
{
    public sealed record GeneratedReportResponse
    (
        Guid Id,
        DateTime CreatedAt,
        DateTime? DateFilter,
        ShiftType? ShiftFilter,
        string? LineNameFilter,
        Guid? EquipmentIdFilter,
        string? EquipmentName
    );
}
