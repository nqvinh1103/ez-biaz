using EzBias.Domain.Entities;

namespace EzBias.Application.Services.Auth;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, string? planId);
    int GetAccessTokenExpiresInSeconds();
}
