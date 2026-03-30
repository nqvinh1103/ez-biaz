using EzBias.Contracts.Features.Payments.Dtos;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayAuctionPayment;

public record CreateVnpayAuctionPaymentCommand(
    string UserId,
    CreateVnpayAuctionPaymentRequest Request,
    string IpAddress
) : IRequest<PaymentRedirectResult>;
