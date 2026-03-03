namespace Linea.Application.Interfaces
{
    public interface ITelemetryDataGenerator
    {
        Task GenerateTickAsync(CancellationToken cancellationToken = default);
        Task ResetDataAsync(CancellationToken cancellationToken = default);
    }
}
