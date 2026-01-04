using System;

namespace Linea.Application.DTOs
{
    public sealed record AddDefectRequest
    (
        string Type,
        int Quantity,
        string? Comment
    );
}
