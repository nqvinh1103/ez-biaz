using EzBias.Contracts.Features.Payments.Dtos;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayProductBoostPayment;

public record CreateVnpayProductBoostPaymentCommand(
    string UserId,
    CreateVnpayProductBoostPaymentRequest Request,
    string IpAddress
) : IRequest<PaymentRedirectResult>;
