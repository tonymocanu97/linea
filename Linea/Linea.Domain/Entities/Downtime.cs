using System;

namespace Linea.Domain.Entities
{
    public class Downtime
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProductionReportId { get; set; }
        public ProductionReport? ProductionReport { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public string Type { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;

        public TimeSpan Duration => (EndTime ?? DateTime.UtcNow) - StartTime;
    }
}
