namespace Linea.Application.DTOs.Auth
{
    public sealed record LoginResponse(string Token, string Username, string Role);
}
