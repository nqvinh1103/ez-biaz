using EzBias.Contracts.Features.Payments.Dtos;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayOrderPayment;

public record CreateVnpayOrderPaymentCommand(CreateVnpayOrderPaymentRequest Request, string IpAddress)
    : IRequest<PaymentRedirectResult>;
