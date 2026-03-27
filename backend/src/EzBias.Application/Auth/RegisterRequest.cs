namespace EzBias.Application.Auth;

public record RegisterRequest(string FullName, string Email, string Password, string? Phone);
