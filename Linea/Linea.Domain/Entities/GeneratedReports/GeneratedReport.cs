using Linea.Domain.Enums;

namespace Linea.Domain.Entities.GeneratedReports
{
    public class GeneratedReport
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? DateFilter { get; set; }
        public ShiftType? ShiftFilter { get; set; }
        public string? LineNameFilter { get; set; }
        public Guid? EquipmentIdFilter { get; set; }
        
        public string? EquipmentName { get; set; }
    }
}
