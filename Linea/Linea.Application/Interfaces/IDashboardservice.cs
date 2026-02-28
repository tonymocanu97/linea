using Linea.Application.DTOs.Dashboard;
using Linea.Application.DTOs.Downtime;
using Linea.Application.DTOs.Equipment;
using Linea.Domain.Entities.Dashboard;

namespace Linea.Application.Interfaces
{
    public interface IDashboardservice
    {
        Task<DashboardSummary> GetSummaryAsync(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken = default);
        Task<List<HourlyProductionPoint>> GetHourlyProduction(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken);
        Task<List<ActiveDowntimeResponse>> GetActiveDowntimes(string? lineName, CancellationToken cancellationToken);
        Task<List<ActiveDowntimeResponse>> GetDowntimes(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken = default);
        Task<List<EquipmentStatusSummary>> GetEquipmentStatus(string? lineName, CancellationToken cancellationToken);

        Task<EquipmentResponse> AddEquipmentAsync(CreateEquipmentRequest equipment, CancellationToken cancellationToken = default);
        Task<EquipmentResponse> UpdateEquipmentAsync(Guid id, UpdateEquipmentRequest equipment, CancellationToken cancellationToken = default);
        Task<EquipmentResponse> SetMaintenanceModeAsync(Guid id, SetMaintenanceModeRequest request, CancellationToken cancellationToken = default);
        Task DeleteEquipmentAsync(Guid id, CancellationToken cancellationToken = default);

    }
}
