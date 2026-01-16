using Linea.Domain.Enums;

namespace Linea.Domain.Entities
{
    public class ProductionReport
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime Date { get; set; }
        public ShiftType Shift { get; set; }

        public string LineName { get; set; } = string.Empty;
        public string EquipmentName { get; set; } = string.Empty;

        public int GoodCount { get; set; }
        public int ScrapCount { get; set; }

        public string? Notes { get; set; }

        public List<Defect> Defects { get; set; } = new();
        public List<Downtime> Downtimes { get; set; } = new();

        public decimal? OeePercent { get; set; }
    }
}
