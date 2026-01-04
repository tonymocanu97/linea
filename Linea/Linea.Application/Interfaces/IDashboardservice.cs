using Linea.Application.DTOs.Dashboard;

namespace Linea.Application.Interfaces
{
    public interface IDashboardservice
    {
        Task<DashboardSummary> GetSummaryAsync(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken = default);
    }
}
