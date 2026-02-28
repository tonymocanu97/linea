namespace Linea.Application.Interfaces
{
    public interface IInsightsService
    {
        Task<string> AskAsync(string question, DateOnly? from, DateOnly? to, string? lineName, CancellationToken cancellationToken = default);
    }
}
