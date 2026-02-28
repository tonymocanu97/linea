using System;

namespace Linea.Domain.Entities.Reports
{
    public class Defect
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProductionReportId { get; set; }
        public ProductionReport? ProductionReport { get; set; }
        
        public string Type { get; set; } = string.Empty;
        public int Quantity { get; set; }

        public string? Comment { get; set; }
    }
}
