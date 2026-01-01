using Linea.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Linea.Infrastructure.Persistence
{
    public class LineaDbContext : DbContext
    {
        public LineaDbContext(DbContextOptions<LineaDbContext> options) : base(options) { }

        public DbSet<ProductionReport> ProductionReports => Set<ProductionReport>();
        public DbSet<Defect> Defects => Set<Defect>();
        public DbSet<Downtime> Downtimes => Set<Downtime>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProductionReport>(b =>
            {
                b.ToTable("production_reports");
                b.HasKey(x => x.Id);

                b.Property(x => x.LineName).HasMaxLength(100);

                b.HasIndex(x => new { x.Date, x.Shift, x.LineName }).IsUnique();

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

                b.Property(x => x.Reason).HasMaxLength(200);

                b.Ignore(x => x.Duration);
            });
        }
    }
}
