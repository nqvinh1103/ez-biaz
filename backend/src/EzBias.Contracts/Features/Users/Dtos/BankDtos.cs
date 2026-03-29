namespace EzBias.Contracts.Features.Users.Dtos;

public record UpdateBankInfoRequest(
    string BankName,
    string BankAccountNumber,
    string BankAccountName
);
