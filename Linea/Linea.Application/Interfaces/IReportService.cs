using Linea.Application.DTOs.Defect;
using Linea.Application.DTOs.Downtime;
using Linea.Application.DTOs.Reports;
using Linea.Domain.Enums;

namespace Linea.Application.Interfaces
{
    public interface IReportService
    {
        Task<ReportResponse> CreateAsync(CreateReportRequest request, CancellationToken ct = default);
        Task<ReportResponse?> GetByIdAsync (Guid id, CancellationToken ct = default);

        Task<IReadOnlyList<ReportResponse>> GetAsync(
            DateTime? date,
            ShiftType? shift,
            string? lineName,
            string? equipmentName,
            CancellationToken ct = default);

        Task<ReportResponse?> AddDefectAsync(Guid reportId, AddDefectRequest request, CancellationToken ct = default);
        Task<ReportResponse?> AddDowntimeAsync(Guid reportId, AddDowntimeRequest request, CancellationToken ct = default);
    }
}
