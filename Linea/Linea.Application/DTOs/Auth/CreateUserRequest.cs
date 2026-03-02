using Linea.Domain.Enums;

namespace Linea.Application.DTOs.Auth
{
    public sealed record CreateUserRequest(string Username, string Password, UserRole Role);
}
