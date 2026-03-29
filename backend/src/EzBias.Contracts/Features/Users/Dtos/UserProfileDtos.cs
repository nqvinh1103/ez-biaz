namespace EzBias.Contracts.Features.Users.Dtos;

public record MyProfileDto(
    string Id,
    string FullName,
    string Username,
    string Email,
    string Role,
    string Avatar,
    string AvatarBg,
    string Phone,
    string Address,
    string City,
    string Zip,
    string BankName,
    string BankAccountNumber,
    string BankAccountName
);
