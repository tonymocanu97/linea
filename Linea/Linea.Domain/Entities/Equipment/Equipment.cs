using Linea.Domain.Entities.Reports;

namespace Linea.Domain.Entities.Equipment
{
    public class Equipment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TargetProductionRate { get; set; }

        public string? Notes { get; set; }

        public List<ProductionReport> ProductionReports { get; set; } = new();
    }
}
