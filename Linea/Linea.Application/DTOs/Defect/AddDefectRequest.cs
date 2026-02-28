using System;

namespace Linea.Application.DTOs.Defect
{
    public sealed record AddDefectRequest
    (
        string Type,
        int Quantity,
        string? Comment
    );
}
