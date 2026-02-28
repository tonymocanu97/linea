using Linea.Application.DTOs.GeneratedReports;

namespace Linea.Application.Interfaces
{
    public interface IGeneratedReportService
    {
        Task<GeneratedReportResponse> CreateAsync(CreateGeneratedReportRequest request, CancellationToken ct = default);
        Task<IReadOnlyList<GeneratedReportResponse>> GetAllAsync(CancellationToken ct = default);
        Task<GeneratedReportResponse?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<byte[]> DownloadAsync(Guid id, CancellationToken ct = default);
    }
}
