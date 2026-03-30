using EzBias.Application.Services.Auth;

namespace EzBias.Infrastructure.Services.Auth;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string raw) => BCrypt.Net.BCrypt.HashPassword(raw);

    public bool Verify(string raw, string hash) => BCrypt.Net.BCrypt.Verify(raw, hash);
}
