namespace EzBias.Contracts.Features.Payments.Dtos;

public record VnpayCreateRequest(
    string TxnRef,
    string OrderInfo,
    long AmountVnd,
    string IpAddress,
    DateTime CreateDateUtc
);
