using Linea.Application.DTOs.Auth;
using Linea.Application.Interfaces;
using Linea.Domain.Entities.Auth;
using Linea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Linea.Infrastructure.Services
{
    public sealed class UserService : IUserService
    {
        private readonly LineaDbContext _database;

        public UserService(LineaDbContext database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _database.Users
                .AsNoTracking()
                .OrderBy(u => u.Username)
                .Select(u => new UserResponse(u.Id, u.Username, u.Role, u.CreatedAt))
                .ToListAsync(cancellationToken);
        }

        public async Task<UserResponse?> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
        {
            var username = request.Username.Trim();
            if (await _database.Users.AnyAsync(u => u.Username == username, cancellationToken))
                return null;

            var user = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role
            };

            _database.Users.Add(user);
            await _database.SaveChangesAsync(cancellationToken);

            return new UserResponse(user.Id, user.Username, user.Role, user.CreatedAt);
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var user = await _database.Users.FindAsync(new object[] { id }, cancellationToken);
            if (user == null)
                return false;

            _database.Users.Remove(user);
            await _database.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
