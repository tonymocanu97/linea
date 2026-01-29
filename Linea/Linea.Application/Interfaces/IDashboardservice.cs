using Linea.Application.DTOs;
using Linea.Application.DTOs.Dashboard;
using Linea.Domain.Entities;

namespace Linea.Application.Interfaces
{
    public interface IDashboardservice
    {
        Task<DashboardSummary> GetSummaryAsync(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken = default);
        Task<List<HourlyProductionPoint>> GetHourlyProduction(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken);
        Task<List<ActiveDowntimeDto>> GetActiveDowntimes(string? lineName, CancellationToken cancellationToken);
        Task<List<EquipmentStatusDto>> GetEquipmentStatus(string? lineName, CancellationToken cancellationToken);

        Task<EquipmentDto> AddEquipmentAsync(CreateEquipmentDto equipment, CancellationToken cancellationToken = default);
        Task<EquipmentDto> UpdateEquipmentAsync(Guid id, UpdateEquipmentDto equipment, CancellationToken cancellationToken = default);
        Task<EquipmentDto> SetMaintenanceModeAsync(Guid id, SetMaintenanceModeDto request, CancellationToken cancellationToken = default);
        Task DeleteEquipmentAsync(Guid id, CancellationToken cancellationToken = default);

    }
}
