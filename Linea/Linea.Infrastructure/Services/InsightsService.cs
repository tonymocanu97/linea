using System.Text;
using Linea.Application.DTOs.Dashboard;
using Linea.Application.DTOs.Downtime;
using Linea.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using OpenAI.Chat;

namespace Linea.Infrastructure.Services
{
    public sealed class InsightsService : IInsightsService
    {
        private readonly IDashboardservice _dashboardService;
        private readonly IConfiguration _configuration;

        public InsightsService(IDashboardservice dashboardService, IConfiguration configuration)
        {
            _dashboardService = dashboardService;
            _configuration = configuration;
        }

        public async Task<string> AskAsync(string question, DateOnly? from, DateOnly? to, string? lineName, CancellationToken cancellationToken = default)
        {
            var apiKey = _configuration["OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return "AI Insights are not configured. Add your OpenAI API key in appsettings.json (OpenAI:ApiKey) or set OPENAI_API_KEY environment variable.";
            }

            var fromDate = from ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
            var toDate = to ?? DateOnly.FromDateTime(DateTime.UtcNow);

            var summary = await _dashboardService.GetSummaryAsync(fromDate, toDate, lineName, cancellationToken);
            var downtimes = await _dashboardService.GetDowntimes(fromDate, toDate, lineName, cancellationToken);
            var equipmentStatus = await _dashboardService.GetEquipmentStatus(lineName, cancellationToken);

            var context = BuildContext(summary, downtimes, equipmentStatus, fromDate, toDate, lineName);
            var systemPrompt = BuildSystemPrompt();

            var client = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(context),
                new UserChatMessage(question)
            };

            var completion = await client.CompleteChatAsync(messages, cancellationToken: cancellationToken);
            var content = completion.Value.Content;
            return content.Count > 0 ? content[0].Text : "No response generated.";
        }

        private static string BuildSystemPrompt()
        {
            return """
                You are an AI assistant for an industrial production monitoring system called Linea.
                You help operators understand production data, equipment status, downtimes, and defects.
                Always respond in English.
                Be concise and data-driven. Use the provided context to answer questions.
                If the context does not contain enough information, say so clearly.
                """;
        }

        private static string BuildContext(
            DashboardSummary summary,
            IReadOnlyList<ActiveDowntimeResponse> downtimes,
            IReadOnlyList<EquipmentStatusSummary> equipmentStatus,
            DateOnly from,
            DateOnly to,
            string? lineName)
        {
            var sb = new StringBuilder();
            sb.AppendLine("## Production context");
            sb.AppendLine($"Period: {from:yyyy-MM-dd} to {to:yyyy-MM-dd}");
            if (!string.IsNullOrWhiteSpace(lineName))
                sb.AppendLine($"Line filter: {lineName}");
            sb.AppendLine();
            sb.AppendLine("### Summary");
            sb.AppendLine($"- Total good units: {summary.TotalGood}");
            sb.AppendLine($"- Total scrap: {summary.TotalScrap}");
            sb.AppendLine($"- Scrap rate: {summary.ScrapRatePercent}%");
            sb.AppendLine($"- Total downtime (minutes): {summary.TotalDowntimeMinutes}");
            sb.AppendLine("Top defects:");
            foreach (var d in summary.TopDefects)
                sb.AppendLine($"  - {d.Type}: {d.Quantity}");
            sb.AppendLine();
            sb.AppendLine("### Recent downtimes");
            foreach (var d in downtimes.Take(20))
            {
                var end = d.EndTime.HasValue ? d.EndTime.Value.ToString("yyyy-MM-dd HH:mm") : "ongoing";
                sb.AppendLine($"- {d.StartTime:yyyy-MM-dd HH:mm} - {end} | {d.Type} | {d.EquipmentName} | {d.LineName} | {d.Duration} min");
            }
            sb.AppendLine();
            sb.AppendLine("### Equipment status");
            foreach (var e in equipmentStatus)
                sb.AppendLine($"- {e.Name}: {e.Status} | Production: {e.ActualProductionRate}/{e.TargetProductionRate} | Efficiency: {e.EfficiencyPercentage}%");
            return sb.ToString();
        }
    }
}
