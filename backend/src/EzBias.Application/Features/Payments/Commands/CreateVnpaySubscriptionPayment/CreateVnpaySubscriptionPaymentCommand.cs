using EzBias.Contracts.Features.Payments.Dtos;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpaySubscriptionPayment;

public record CreateVnpaySubscriptionPaymentCommand(string UserId, CreateVnpaySubscriptionPaymentRequest Request, string IpAddress)
    : IRequest<PaymentRedirectResult>;
