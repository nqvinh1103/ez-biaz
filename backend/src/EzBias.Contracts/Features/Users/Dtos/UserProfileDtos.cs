namespace EzBias.Contracts.Features.Users.Dtos;

public record MyPlanDto(
    string PlanId,
    string Name,
    decimal Price,
    string Status,
    string StartsAt,
    string EndsAt
);

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
    string BankAccountName,
    MyPlanDto? Plan
);
