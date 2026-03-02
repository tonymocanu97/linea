using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Linea.Application.DTOs.Auth;
using Linea.Application.Interfaces;
using Linea.Domain.Entities.Auth;
using Linea.Domain.Enums;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Linea.Infrastructure.Services
{
    public sealed class AuthService : IAuthService
    {
        private readonly LineaDbContext _database;
        private readonly IConfiguration _configuration;

        public AuthService(LineaDbContext database, IConfiguration configuration)
        {
            _database = database;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var username = request.Username?.Trim() ?? string.Empty;
            var password = request.Password ?? string.Empty;

            var user = await _database.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            var token = GenerateJwt(user);
            return new LoginResponse(token, user.Username, user.Role.ToString());
        }

        public async Task<CurrentUserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _database.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            return user == null ? null : new CurrentUserResponse(user.Username, user.Role.ToString());
        }

        private string GenerateJwt(User user)
        {
            var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured.");
            var issuer = _configuration["Jwt:Issuer"] ?? "Linea";
            var audience = _configuration["Jwt:Audience"] ?? "Linea";
            var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "60");

            var keyBytes = Encoding.UTF8.GetBytes(key);
            var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
