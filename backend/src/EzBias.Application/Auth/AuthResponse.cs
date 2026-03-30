namespace EzBias.Application.Auth;

public record AuthResponse(
    AuthUserDto User,
    string AccessToken,
    int ExpiresInSeconds,
    string RefreshToken);
