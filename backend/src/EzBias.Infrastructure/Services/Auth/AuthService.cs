using EzBias.Application.Auth;
using EzBias.Application.Services.Auth;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
    private readonly EzBiasDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly IRefreshTokenService _refresh;

    private readonly int _refreshDays;

    public AuthService(
        EzBiasDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwt,
        IRefreshTokenService refresh,
        int refreshDays)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _refresh = refresh;
        _refreshDays = refreshDays;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim();

        var exists = await _db.Users.AsNoTracking().AnyAsync(u => u.Email.ToLower() == email.ToLower(), ct);
        if (exists)
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var id = "u" + Guid.NewGuid().ToString("N")[..8];
        var username = email.Split('@')[0];

        var user = new User
        {
            Id = id,
            FullName = request.FullName.Trim(),
            Email = email,
            Username = username,
            Phone = request.Phone ?? string.Empty,
            PasswordHash = _passwordHasher.Hash(request.Password),
            JoinedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            Role = "buyer",
            Avatar = BuildInitials(request.FullName),
            AvatarBg = "#ad93e6",
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), ct);
        if (user == null)
        {
            throw new UnauthorizedAccessException("No account found with that email address.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Incorrect password. Please try again.");
        }

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var token = await _refresh.ValidateAsync(request.RefreshToken, ct);
        if (token == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == token.UserId, ct);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        var expiresAt = DateTime.UtcNow.AddDays(_refreshDays);
        var rotated = await _refresh.RotateAsync(request.RefreshToken, expiresAt, ct);

        var accessToken = _jwt.GenerateAccessToken(user);
        var expiresIn = _jwt.GetAccessTokenExpiresInSeconds();

        return new AuthResponse(
            User: MapUser(user),
            AccessToken: accessToken,
            ExpiresInSeconds: expiresIn,
            RefreshToken: rotated.NewRawToken);
    }

    public Task LogoutAsync(LogoutRequest request, CancellationToken ct = default)
        => _refresh.RevokeAsync(request.RefreshToken, ct);

    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var accessToken = _jwt.GenerateAccessToken(user);
        var expiresIn = _jwt.GetAccessTokenExpiresInSeconds();

        var expiresAt = DateTime.UtcNow.AddDays(_refreshDays);
        var created = await _refresh.CreateAsync(user.Id, expiresAt, ct);

        return new AuthResponse(
            User: MapUser(user),
            AccessToken: accessToken,
            ExpiresInSeconds: expiresIn,
            RefreshToken: created.RawToken);
    }

    private static AuthUserDto MapUser(User user) => new(
        Id: user.Id,
        FullName: user.FullName,
        Username: user.Username,
        Email: user.Email,
        Role: user.Role,
        Avatar: user.Avatar,
        AvatarBg: user.AvatarBg);

    private static string BuildInitials(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "U";
        if (parts.Length == 1) return parts[0][0].ToString().ToUpperInvariant();
        return (parts[^2][0].ToString() + parts[^1][0].ToString()).ToUpperInvariant();
    }
}
