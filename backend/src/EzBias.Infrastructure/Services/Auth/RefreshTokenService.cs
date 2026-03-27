using EzBias.Application.Services.Auth;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EzBias.Infrastructure.Services.Auth;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly EzBiasDbContext _db;

    public RefreshTokenService(EzBiasDbContext db)
    {
        _db = db;
    }

    public async Task<(string RawToken, RefreshToken Entity)> CreateAsync(string userId, DateTime expiresAt, CancellationToken ct = default)
    {
        var raw = GenerateRawToken();
        var hash = HashRawToken(raw);

        var entity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = hash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            RevokedAt = null,
            ReplacedByTokenHash = null
        };

        _db.RefreshTokens.Add(entity);
        await _db.SaveChangesAsync(ct);

        return (raw, entity);
    }

    public async Task<RefreshToken?> ValidateAsync(string rawToken, CancellationToken ct = default)
    {
        var hash = HashRawToken(rawToken);
        return await _db.RefreshTokens
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TokenHash == hash && x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow, ct);
    }

    public async Task<(string NewRawToken, RefreshToken NewEntity)> RotateAsync(string rawToken, DateTime newExpiresAt, CancellationToken ct = default)
    {
        var existingHash = HashRawToken(rawToken);
        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == existingHash, ct);

        if (existing == null || existing.RevokedAt != null || existing.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        existing.RevokedAt = DateTime.UtcNow;

        var created = await CreateAsync(existing.UserId, newExpiresAt, ct);
        existing.ReplacedByTokenHash = created.Entity.TokenHash;

        await _db.SaveChangesAsync(ct);

        return (created.RawToken, created.Entity);
    }

    public async Task RevokeAsync(string rawToken, CancellationToken ct = default)
    {
        var hash = HashRawToken(rawToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hash, ct);
        if (token == null) return;

        if (token.RevokedAt == null)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    private static string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string HashRawToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(bytes);
    }
}
