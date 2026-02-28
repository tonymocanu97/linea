using System;

namespace Linea.Application.DTOs.Equipment
{
    public sealed record EquipmentResponse
    (
        Guid Id,
        string Name,
        string Status,
        int TargetProductionRate,
        string? Notes
    );
}
