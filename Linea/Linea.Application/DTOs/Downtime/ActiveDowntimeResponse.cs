using System;

namespace Linea.Application.DTOs.Downtime
{
    public sealed record ActiveDowntimeResponse
    (
        Guid Id,
        DateTime StartTime,
        DateTime? EndTime,
        string Type,
        string Reason,
        string LineName,
        string EquipmentName,
        int Duration
    );
}
