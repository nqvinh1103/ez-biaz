namespace EzBias.Application.Auth;

public record AuthUserDto(
    string Id,
    string FullName,
    string Username,
    string Email,
    string Role,
    string Avatar,
    string AvatarBg);
