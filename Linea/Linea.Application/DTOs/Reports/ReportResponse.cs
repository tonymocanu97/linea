using Linea.Application.DTOs.Defect;
using Linea.Application.DTOs.Downtime;
using Linea.Domain.Enums;

namespace Linea.Application.DTOs.Reports
{
    public sealed record ReportResponse
    (
        Guid Id,
        DateTime Date,
        ShiftType Shift,
        string LineName,
        string EquipmentName,
        int GoodCount,
        int ScrapCount,
        string? Notes,
        IReadOnlyList<DefectResponse> Defects,
        IReadOnlyList<DowntimeResponse> Downtimes
    );
}
