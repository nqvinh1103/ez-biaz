using EzBias.Domain.Entities;

namespace EzBias.Application.Services.Auth;

public interface IRefreshTokenService
{
    Task<(string RawToken, RefreshToken Entity)> CreateAsync(string userId, DateTime expiresAt, CancellationToken ct = default);
    Task<RefreshToken?> ValidateAsync(string rawToken, CancellationToken ct = default);
    Task<(string NewRawToken, RefreshToken NewEntity)> RotateAsync(string rawToken, DateTime newExpiresAt, CancellationToken ct = default);
    Task RevokeAsync(string rawToken, CancellationToken ct = default);
}
