namespace EzBias.Contracts.Features.Payments.Dtos;

public record PayoutPendingDto(
    string PayoutId,
    string OrderId,
    string SellerId,
    decimal Amount,
    string Status,
    string BankName,
    string BankAccountNumber,
    string BankAccountName
);
