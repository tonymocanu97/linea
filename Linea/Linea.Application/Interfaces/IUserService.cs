using Linea.Application.DTOs.Auth;

namespace Linea.Application.Interfaces
{
    public interface IUserService
    {
        Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<UserResponse?> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
