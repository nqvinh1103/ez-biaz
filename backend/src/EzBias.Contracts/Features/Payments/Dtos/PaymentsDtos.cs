using EzBias.Contracts.Features.Orders.Dtos;

namespace EzBias.Contracts.Features.Payments.Dtos;

public record CreateVnpayOrderPaymentRequest(CheckoutRequest Checkout);

public record CreateVnpaySubscriptionPaymentRequest(string PlanId);

public record PaymentRedirectResult(
    string PaymentId,
    string PayUrl,
    decimal Amount
);
