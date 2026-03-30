using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Payments.Dtos;
using EzBias.Domain.Entities.Payments;
using MediatR;
using System.Text.Json;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayAuctionPayment;

public class CreateVnpayAuctionPaymentCommandHandler(
    IPaymentRepository payments,
    IAuctionRepository auctions,
    IVnpayService vnpay) : IRequestHandler<CreateVnpayAuctionPaymentCommand, PaymentRedirectResult>
{
    public async Task<PaymentRedirectResult> Handle(CreateVnpayAuctionPaymentCommand request, CancellationToken cancellationToken)
    {
        var auctionId = (request.Request.AuctionId ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(auctionId))
            throw new ArgumentException("AuctionId is required.");

        var a = await auctions.GetAuctionForBiddingAsync(auctionId, cancellationToken);
        if (a is null)
            throw new ArgumentException("Auction not found.");

        if (a.IsLive)
            throw new ArgumentException("Auction is still live.");

        if (a.Status != "ended_pending_payment")
            throw new ArgumentException("This auction is not awaiting payment.");

        if (!string.Equals(a.WinnerId, request.UserId, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Only the winner can pay for this auction.");

        var amount = a.FinalPrice ?? a.CurrentBid;
        if (amount <= 0)
            throw new ArgumentException("Invalid auction final price.");

        var amountVnd = (long)decimal.Round(amount, 0);

        var paymentId = await payments.NextPaymentIdAsync(cancellationToken);
        var payload = JsonSerializer.Serialize(request.Request.ShippingInfo);

        var payment = new Payment
        {
            Id = paymentId,
            Provider = "vnpay",
            Type = "auction",
            UserId = request.UserId,
            Reference = auctionId,
            Payload = payload,
            Amount = amount,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        await payments.AddAsync(payment, cancellationToken);
        await payments.SaveChangesAsync(cancellationToken);

        var payUrl = vnpay.CreatePaymentUrl(new VnpayCreateRequest(
            TxnRef: paymentId,
            OrderInfo: $"Auction payment {auctionId}",
            AmountVnd: amountVnd,
            IpAddress: request.IpAddress,
            CreateDateUtc: DateTime.UtcNow
        ));

        return new PaymentRedirectResult(paymentId, payUrl, amount);
    }
}
