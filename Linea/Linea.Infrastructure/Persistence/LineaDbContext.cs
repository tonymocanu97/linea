using Linea.Domain.Entities.Equipment;
using Linea.Domain.Entities.GeneratedReports;
using Linea.Domain.Entities.Reports;
using Microsoft.EntityFrameworkCore;

namespace Linea.Infrastructure.Persistence
{
    public class LineaDbContext : DbContext
    {
        public LineaDbContext(DbContextOptions<LineaDbContext> options) : base(options) { }

        public DbSet<ProductionReport> ProductionReports => Set<ProductionReport>();
        public DbSet<Defect> Defects => Set<Defect>();
        public DbSet<Downtime> Downtimes => Set<Downtime>();
        public DbSet<Equipment> Equipment => Set<Equipment>();
        public DbSet<GeneratedReport> GeneratedReports => Set<GeneratedReport>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProductionReport>(b =>
            {
                b.ToTable("production_reports");
                b.HasKey(x => x.Id);

                b.Property(x => x.LineName).HasMaxLength(100);
                
                b.HasOne(x => x.Equipment)
                    .WithMany(e => e.ProductionReports)
                    .HasForeignKey(x => x.EquipmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasIndex(x => new { x.Date, x.Shift, x.LineName, x.EquipmentId }).IsUnique();

                b.HasMany(x => x.Defects)
                    .WithOne(x => x.ProductionReport!)
                    .HasForeignKey(x => x.ProductionReportId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasMany(x => x.Downtimes)
                    .WithOne(x => x.ProductionReport!)
                    .HasForeignKey(x => x.ProductionReportId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Defect>(b =>
            {
                b.ToTable("defects");
                b.HasKey(x => x.Id);

                b.Property(x => x.Type).HasMaxLength(120);
                b.Property(x => x.Quantity).HasDefaultValue(0);
            });

            modelBuilder.Entity<Downtime>(b =>
            {
                b.ToTable("downtimes");
                b.HasKey(x => x.Id);

                b.Property(x => x.Type).HasMaxLength(120);
                b.Property(x => x.Reason).HasMaxLength(200);

                b.Ignore(x => x.Duration);
            });

            modelBuilder.Entity<Equipment>(b =>
            {
                b.ToTable("equipments");
                b.HasKey(x => x.Id);

                b.Property(x => x.Name).HasMaxLength(100);
                b.Property(x => x.Status).HasMaxLength(50);
                b.Property(x => x.TargetProductionRate).HasDefaultValue(0);
                b.Property(x => x.Notes).HasMaxLength(500);
            });

            modelBuilder.Entity<GeneratedReport>(b =>
            {
                b.ToTable("generated_reports");
                b.HasKey(x => x.Id);

                b.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                b.Property(x => x.LineNameFilter).HasMaxLength(100);
                b.Property(x => x.EquipmentName).HasMaxLength(100);
                
                b.HasIndex(x => x.CreatedAt);
            });
        }
    }
}
