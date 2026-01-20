using Linea.Application.DTOs;
using Linea.Application.DTOs.Dashboard;

namespace Linea.Application.Interfaces
{
    public interface IDashboardservice
    {
        Task<DashboardSummary> GetSummaryAsync(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken = default);
        Task<List<HourlyProductionPoint>> GetHourlyProduction(DateOnly from, DateOnly to, string? lineName, CancellationToken cancellationToken);
        Task<List<ActiveDowntimeDto>> GetActiveDowntimes(string? lineName, CancellationToken cancellationToken);
    }

    public class HourlyProductionPoint
    {
        public int Hour { get; set; }
        public int Production { get; set; }
        public int Target { get; set; }
    }
}
