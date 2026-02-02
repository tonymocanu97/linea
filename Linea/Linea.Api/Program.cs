using Linea.Application.Interfaces;
using Linea.Infrastructure.Persistence;
using Linea.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddOpenApi();

builder.Services.AddDbContext<LineaDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("LineaDb"));
});

builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardservice, DashboardService>();
builder.Services.AddScoped<IGeneratedReportService, GeneratedReportService>();

if (builder.Environment.IsDevelopment())
{
    //builder.Services.AddHostedService<TelemetrySimulatorService>();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "Linea API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
