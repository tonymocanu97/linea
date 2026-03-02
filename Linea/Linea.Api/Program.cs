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

builder.Services.AddDbContext<LineaDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("LineaDb"));
});

builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardservice, DashboardService>();
builder.Services.AddScoped<IGeneratedReportService, GeneratedReportService>();
builder.Services.AddScoped<IInsightsService, InsightsService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

if (builder.Environment.IsDevelopment())
{
    //builder.Services.AddHostedService<TelemetrySimulatorService>();
}

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
