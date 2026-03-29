using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities.Payments;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.HandleVnpayCallback;

public class HandleVnpayCallbackCommandHandler(
    IVnpayService vnpay,
    IPaymentRepository payments,
    ISubscriptionRepository subs,
    IOrderRepository orders,
    IEscrowRepository escrow) : IRequestHandler<HandleVnpayCallbackCommand, Unit>
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

        payment.Status = "paid";
        payment.PaidAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        payment.ProviderOrderId = transactionNo;

        if (payment.Type == "order")
        {
            var orderIds = await payments.GetOrderIdsForPaymentAsync(payment.Id, cancellationToken);
            var trackedOrders = await orders.GetTrackedByIdsAsync(orderIds, cancellationToken);

            foreach (var o in trackedOrders)
            {
                o.Status = "paid";
                o.UpdatedAt = DateTime.UtcNow;

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

            // Clear buyer cart AFTER successful payment
            await orders.ClearCartAsync(payment.UserId, cancellationToken);
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
