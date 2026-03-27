using EzBias.Domain.Entities;

namespace EzBias.Application.Services.Auth;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    int GetAccessTokenExpiresInSeconds();
}
