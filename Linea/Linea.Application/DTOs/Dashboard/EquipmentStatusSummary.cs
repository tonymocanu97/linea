using System;

namespace Linea.Application.DTOs.Dashboard
{
    public sealed record EquipmentStatusSummary
    (
        string Id,
        string Name,
        string Status,
        int ActualProductionRate,
        int TargetProductionRate,
        int EfficiencyPercentage
    );
}
