using System;

namespace Linea.Application.DTOs.Equipment
{
    public sealed record UpdateEquipmentRequest
    (
        string? Name,
        string? Status,
        int? TargetProductionRate,
        string? Notes
    );
}
