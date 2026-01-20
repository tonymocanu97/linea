using System;

namespace Linea.Domain.Entities
{
    public class HourlyProductionPoint
    {
        public int Hour { get; set; }
        public int Production { get; set; }
        public int Target { get; set; }
    }
}
