using EzBias.Application.Services.Auth;
using EzBias.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EzBias.Infrastructure.Services.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly string _secret;
    private readonly int _accessMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        _secret = configuration["Jwt:Secret"] ?? "CHANGE_ME_DEV_SECRET_32CHARS_MIN";
        _accessMinutes = int.TryParse(configuration["Jwt:AccessTokenMinutes"], out var m) ? m : 15;

        if (_secret.Length < 32)
        {
            // HMACSHA256 key should be >= 256 bits
            _secret = _secret.PadRight(32, 'x');
        }
    }

    public string GenerateAccessToken(User user, string? planId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("username", user.Username),
            new("fullName", user.FullName)
        };

        if (!string.IsNullOrWhiteSpace(planId))
            claims.Add(new Claim("planId", planId));

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_accessMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public int GetAccessTokenExpiresInSeconds() => _accessMinutes * 60;
}
