using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Linea.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "equipments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    TargetProductionRate = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_equipments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "generated_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    DateFilter = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ShiftFilter = table.Column<int>(type: "INTEGER", nullable: true),
                    LineNameFilter = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    EquipmentIdFilter = table.Column<Guid>(type: "TEXT", nullable: true),
                    EquipmentName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_generated_reports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "production_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Shift = table.Column<int>(type: "INTEGER", nullable: false),
                    LineName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    EquipmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    GoodCount = table.Column<int>(type: "INTEGER", nullable: false),
                    ScrapCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    OeePercent = table.Column<decimal>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_production_reports_equipments_EquipmentId",
                        column: x => x.EquipmentId,
                        principalTable: "equipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "defects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductionReportId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    Comment = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_defects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_defects_production_reports_ProductionReportId",
                        column: x => x.ProductionReportId,
                        principalTable: "production_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "downtimes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductionReportId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Type = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_downtimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_downtimes_production_reports_ProductionReportId",
                        column: x => x.ProductionReportId,
                        principalTable: "production_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_defects_ProductionReportId",
                table: "defects",
                column: "ProductionReportId");

            migrationBuilder.CreateIndex(
                name: "IX_downtimes_ProductionReportId",
                table: "downtimes",
                column: "ProductionReportId");

            migrationBuilder.CreateIndex(
                name: "IX_generated_reports_CreatedAt",
                table: "generated_reports",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_production_reports_Date_Shift_LineName_EquipmentId",
                table: "production_reports",
                columns: new[] { "Date", "Shift", "LineName", "EquipmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_production_reports_EquipmentId",
                table: "production_reports",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Username",
                table: "users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "defects");

            migrationBuilder.DropTable(
                name: "downtimes");

            migrationBuilder.DropTable(
                name: "generated_reports");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "production_reports");

            migrationBuilder.DropTable(
                name: "equipments");
        }
    }
}
