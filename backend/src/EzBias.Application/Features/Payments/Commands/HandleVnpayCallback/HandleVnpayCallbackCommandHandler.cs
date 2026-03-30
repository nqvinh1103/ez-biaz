using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities.Payments;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.HandleVnpayCallback;

using EzBias.Application.Features.Orders.Commands.Checkout;
using EzBias.Application.Features.Orders.Models;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;
using System.Text.Json;

file sealed record CheckoutPayload(ShippingInfo ShippingInfo, string? PaymentMethod);
file sealed record AuctionShippingPayload(ShippingInfo ShippingInfo);

public class HandleVnpayCallbackCommandHandler(
    IVnpayService vnpay,
    IPaymentRepository payments,
    ISubscriptionRepository subs,
    IAuctionRepository auctions,
    IProductRepository products,
    IProductBoostRepository boosts,
    IOrderRepository orders,
    IEscrowRepository escrow,
    IMediator mediator) : IRequestHandler<HandleVnpayCallbackCommand, Unit>
{
    public async Task<Unit> Handle(HandleVnpayCallbackCommand request, CancellationToken cancellationToken)
    {
        if (!vnpay.ValidateCallback(request.Query))
            throw new ArgumentException("Invalid VNPay signature.");

        request.Query.TryGetValue("vnp_TxnRef", out var txnRef);
        request.Query.TryGetValue("vnp_ResponseCode", out var responseCode);
        request.Query.TryGetValue("vnp_TransactionNo", out var transactionNo);

        if (string.IsNullOrWhiteSpace(txnRef))
            return Unit.Value;

        var payment = await payments.GetByIdAsync(txnRef!, cancellationToken);
        if (payment is null) return Unit.Value;

        // idempotent
        if (payment.Status == "paid") return Unit.Value;

        if (!string.Equals(responseCode, "00", StringComparison.OrdinalIgnoreCase))
        {
            payment.Status = "failed";
            payment.UpdatedAt = DateTime.UtcNow;
            payment.ProviderOrderId = transactionNo;
            await payments.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }

        // For order payments: create orders only AFTER successful payment (Option A)
        if (payment.Type == "order")
        {
            if (string.IsNullOrWhiteSpace(payment.Payload))
                throw new ArgumentException("Missing checkout payload for payment.");

            var payload = JsonSerializer.Deserialize<CheckoutPayload>(payment.Payload);
            if (payload?.ShippingInfo is null)
                throw new ArgumentException("Missing shipping info for payment.");

            var shippingInfo = new ShippingInfoModel(
                payload.ShippingInfo.FullName,
                payload.ShippingInfo.Email,
                payload.ShippingInfo.Address,
                payload.ShippingInfo.City,
                payload.ShippingInfo.Zip,
                payload.ShippingInfo.Phone
            );

            var model = new CheckoutModel(
                payment.UserId,
                shippingInfo,
                "vnpay",
                null
            );

            var checkoutResult = await mediator.Send(new CheckoutCommand(model), cancellationToken);

            // Attach payment -> orders mapping
            payment.Orders = checkoutResult.Orders
                .Select(o => new PaymentOrder { PaymentId = payment.Id, OrderId = o.Id })
                .ToList();

            // Escrow IN per order
            foreach (var o in checkoutResult.Orders)
            {
                await escrow.AddAsync(new EscrowTransaction
                {
                    Id = await escrow.NextEscrowIdAsync(cancellationToken),
                    OrderId = o.Id,
                    SellerId = o.SellerId,
                    Type = "IN",
                    Amount = o.Total,
                    PaymentId = payment.Id,
                    CreatedAt = DateTime.UtcNow
                }, cancellationToken);
            }

            // Mark payment paid after order creation
            payment.Status = "paid";
            payment.PaidAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            payment.ProviderOrderId = transactionNo;
        }
        else if (payment.Type == "subscription")
        {
            var planId = (payment.Reference ?? string.Empty).Trim().ToLowerInvariant();
            if (planId is not ("boost" or "premium"))
                throw new ArgumentException("Invalid subscription plan.");

            var now = DateTime.UtcNow;
            var endsAt = planId == "boost" ? now.AddHours(24) : now.AddDays(30);

            var active = await subs.GetActiveAsync(payment.UserId, cancellationToken);
            if (active is not null)
            {
                active.Status = "canceled";
                active.UpdatedAt = now;
            }

            var subId = await subs.NextSubscriptionIdAsync(cancellationToken);
            await subs.AddAsync(new EzBias.Domain.Entities.UserSubscription
            {
                Id = subId,
                UserId = payment.UserId,
                PlanId = planId,
                Status = "active",
                StartsAt = now,
                EndsAt = endsAt,
                CreatedAt = now
            }, cancellationToken);

            payment.Status = "paid";
            payment.PaidAt = now;
            payment.UpdatedAt = now;
            payment.ProviderOrderId = transactionNo;
        }
        else if (payment.Type == "auction")
        {
            var now = DateTime.UtcNow;
            var auctionId = (payment.Reference ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(auctionId))
                throw new ArgumentException("Missing auction reference for payment.");

            var a = await auctions.GetAuctionForBiddingAsync(auctionId, cancellationToken);
            if (a is null)
                throw new ArgumentException("Auction not found.");

            if (a.IsLive)
                throw new ArgumentException("Auction is still live.");

            if (a.Status != "ended_pending_payment")
                throw new ArgumentException("Auction is not awaiting payment.");

            if (!string.Equals(a.WinnerId, payment.UserId, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Only the winner can pay.");

            if (string.IsNullOrWhiteSpace(payment.Payload))
                throw new ArgumentException("Missing shipping info for auction payment.");

            var ship = JsonSerializer.Deserialize<ShippingInfo>(payment.Payload);
            if (ship is null)
                throw new ArgumentException("Missing shipping info for auction payment.");

            if (string.IsNullOrWhiteSpace(a.ProductId))
                throw new ArgumentException("Auction has no product.");

            var product = await products.GetTrackedByIdAsync(a.ProductId, cancellationToken);
            if (product is null)
                throw new ArgumentException("Product not found for auction.");

            // create order
            var orderId = await orders.NextOrderIdAsync(cancellationToken);
            var total = a.FinalPrice ?? a.CurrentBid;
            var order = new EzBias.Domain.Entities.Order
            {
                Id = orderId,
                UserId = payment.UserId,
                SellerId = a.SellerId,
                ShippingFee = 0m,
                Total = total,
                Status = "paid",
                Payment = "vnpay",
                Address = $"{ship.FullName} | {ship.Phone} | {ship.Address}, {ship.City} {ship.Zip}",
                CreatedAt = DateOnly.FromDateTime(now)
            };

            order.Items.Add(new EzBias.Domain.Entities.OrderItem
            {
                OrderId = orderId,
                ProductId = product.Id,
                Name = product.Name,
                Quantity = 1,
                Price = total
            });

            await orders.AddOrderAsync(order, cancellationToken);

            // link payment -> order
            payment.Orders = new List<PaymentOrder> { new() { PaymentId = payment.Id, OrderId = orderId } };

            // Escrow IN
            await escrow.AddAsync(new EscrowTransaction
            {
                Id = await escrow.NextEscrowIdAsync(cancellationToken),
                OrderId = orderId,
                SellerId = a.SellerId,
                Type = "IN",
                Amount = total,
                PaymentId = payment.Id,
                CreatedAt = now
            }, cancellationToken);

            // finalize auction + product
            a.Status = "sold";
            a.UpdatedAt = now;

            product.IsAuction = false;
            product.UpdatedAt = now;

            payment.Status = "paid";
            payment.PaidAt = now;
            payment.UpdatedAt = now;
            payment.ProviderOrderId = transactionNo;

            await orders.SaveChangesAsync(cancellationToken);
            await products.SaveChangesAsync(cancellationToken);
            await auctions.SaveChangesAsync(cancellationToken);
        }
        else if (payment.Type == "product_boost")
        {
            var now = DateTime.UtcNow;
            var productId = (payment.Reference ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(productId))
                throw new ArgumentException("Missing product reference for boost payment.");

            var product = await products.GetByIdAsync(productId, cancellationToken);
            if (product is null)
                throw new ArgumentException("Product not found for boost.");

            if (!string.Equals(product.SellerId, payment.UserId, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("You can only boost your own listing.");

            var hasActive = await boosts.HasActiveBoostAsync(productId, now, cancellationToken);
            if (hasActive)
                throw new ArgumentException("This listing is already boosted.");

            var boostId = await boosts.NextIdAsync(cancellationToken);
            await boosts.AddAsync(new EzBias.Domain.Entities.ProductBoost
            {
                Id = boostId,
                ProductId = productId,
                UserId = payment.UserId,
                Status = "active",
                StartsAt = now,
                EndsAt = now.AddHours(24),
                PaymentId = payment.Id,
                CreatedAt = now
            }, cancellationToken);
            await boosts.SaveChangesAsync(cancellationToken);

            payment.Status = "paid";
            payment.PaidAt = now;
            payment.UpdatedAt = now;
            payment.ProviderOrderId = transactionNo;
        }

        await payments.SaveChangesAsync(cancellationToken);
        await escrow.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
