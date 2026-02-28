using System;

namespace Linea.Application.DTOs.Defect
{
    public sealed record DefectResponse
    (
        Guid Id,
        string Type,
        int Quantity,
        string? Comment
    );
}
