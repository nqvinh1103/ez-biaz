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

public class HandleVnpayCallbackCommandHandler(
    IVnpayService vnpay,
    IPaymentRepository payments,
    ISubscriptionRepository subs,
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
        }

        await payments.SaveChangesAsync(cancellationToken);
        await escrow.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
