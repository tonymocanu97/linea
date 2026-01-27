using System;

namespace Linea.Application.DTOs
{
    public sealed record AddDowntimeRequest
    (
        DateTime StartTime,
        DateTime EndTime,
        string Type,
        string Reason
    );
}
