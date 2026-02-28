using System;

namespace Linea.Application.DTOs.Downtime
{
    public sealed record DowntimeResponse
    (
        Guid Id,
        DateTime StartTime,
        DateTime EndTime,
        string Type,
        string Reason,
        int Duration
    );
}
