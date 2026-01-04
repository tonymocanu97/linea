using Linea.Application.DTOs;
using Linea.Domain.Enums;

namespace Linea.Application.Interfaces
{
    public interface IReportService
    {
        Task<ReportDto> CreateAsync(CreateReportRequest request, CancellationToken ct = default);
        Task<ReportDto?> GetByIdAsync (Guid id, CancellationToken ct = default);

        Task<IReadOnlyList<ReportDto>> GetAsync(
            DateOnly? date,
            ShiftType? shift,
            string? lineName,
            CancellationToken ct = default);

        Task<ReportDto?> AddDefectAsync(Guid reportId, AddDefectRequest request, CancellationToken ct = default);
        Task<ReportDto?> AddDowntimeAsync(Guid reportId, AddDowntimeRequest request, CancellationToken ct = default);
    }
}
