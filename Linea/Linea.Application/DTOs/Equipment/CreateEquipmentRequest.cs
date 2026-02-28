using System;

namespace Linea.Application.DTOs.Equipment
{
    public sealed record CreateEquipmentRequest
    (
        string Name,
        string Status,
        int TargetProductionRate,
        string? Notes
    );
}
