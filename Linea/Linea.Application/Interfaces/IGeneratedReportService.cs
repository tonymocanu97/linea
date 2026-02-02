using Linea.Application.DTOs;

namespace Linea.Application.Interfaces
{
    public interface IGeneratedReportService
    {
        Task<GeneratedReportDto> CreateAsync(CreateGeneratedReportRequest request, CancellationToken ct = default);
        Task<IReadOnlyList<GeneratedReportDto>> GetAllAsync(CancellationToken ct = default);
        Task<GeneratedReportDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<byte[]> DownloadAsync(Guid id, CancellationToken ct = default);
    }
}
