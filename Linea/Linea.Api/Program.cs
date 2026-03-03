using System.Text;
using Linea.Application.Interfaces;
using Linea.Domain.Entities.Auth;
using Linea.Domain.Enums;
using Linea.Infrastructure.Persistence;
using Linea.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is required in appsettings.json");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Linea";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "Linea";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:5203")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "linea.db");
builder.Services.AddDbContext<LineaDbContext>(options =>
{
    options.UseSqlite($"Data Source={dbPath}");
});

builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardservice, DashboardService>();
builder.Services.AddScoped<IGeneratedReportService, GeneratedReportService>();
builder.Services.AddScoped<IInsightsService, InsightsService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITelemetryDataGenerator, TelemetryDataGeneratorService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LineaDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any())
    {
        db.Users.Add(new User
        {
            Username = "supervisor",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("supervisor123"),
            Role = UserRole.Supervisor
        });
        db.Users.Add(new User
        {
            Username = "engineer",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("engineer123"),
            Role = UserRole.Engineer
        });
        db.Users.Add(new User
        {
            Username = "operator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("operator123"),
            Role = UserRole.Operator
        });
        db.SaveChanges();
    }

    if (!db.Equipment.Any())
    {
        db.Equipment.Add(new Linea.Domain.Entities.Equipment.Equipment
        {
            Name = "Press Machine 1",
            Status = "Running",
            TargetProductionRate = 1000,
            Notes = "Seed equipment for demo"
        });
        db.Equipment.Add(new Linea.Domain.Entities.Equipment.Equipment
        {
            Name = "Assembly Line A",
            Status = "Running",
            TargetProductionRate = 2000,
            Notes = "Seed equipment for demo"
        });
        db.SaveChanges();
    }
}

app.UseAuthentication();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "Linea API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowAngular");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
