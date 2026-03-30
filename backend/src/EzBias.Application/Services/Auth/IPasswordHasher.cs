namespace EzBias.Application.Services.Auth;

public interface IPasswordHasher
{
    string Hash(string raw);
    bool Verify(string raw, string hash);
}
