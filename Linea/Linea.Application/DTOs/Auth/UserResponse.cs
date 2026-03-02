using Linea.Domain.Enums;

namespace Linea.Application.DTOs.Auth
{
    public sealed record UserResponse(Guid Id, string Username, UserRole Role, DateTime CreatedAt);
}
