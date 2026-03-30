using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Payments.Dtos;
using EzBias.Domain.Entities.Payments;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpaySubscriptionPayment;

public class CreateVnpaySubscriptionPaymentCommandHandler(
    IPaymentRepository payments,
    IVnpayService vnpay) : IRequestHandler<CreateVnpaySubscriptionPaymentCommand, PaymentRedirectResult>
{
    public async Task<PaymentRedirectResult> Handle(CreateVnpaySubscriptionPaymentCommand request, CancellationToken cancellationToken)
    {
        var planId = (request.Request.PlanId ?? string.Empty).Trim().ToLowerInvariant();
        if (planId is not ("boost" or "premium"))
            throw new ArgumentException("Invalid planId. Allowed: boost | premium.");

        // Demo pricing (VND)
        var amount = planId == "boost" ? 19000m : 99000m;
        var amountVnd = (long)decimal.Round(amount, 0);

        var paymentId = await payments.NextPaymentIdAsync(cancellationToken);
        var payment = new Payment
        {
            Id = paymentId,
            Provider = "vnpay",
            Type = "subscription",
            UserId = request.UserId,
            Reference = planId,
            Amount = amount,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        await payments.AddAsync(payment, cancellationToken);
        await payments.SaveChangesAsync(cancellationToken);

        var payUrl = vnpay.CreatePaymentUrl(new VnpayCreateRequest(
            TxnRef: paymentId,
            OrderInfo: $"Subscription {planId}",
            AmountVnd: amountVnd,
            IpAddress: request.IpAddress,
            CreateDateUtc: DateTime.UtcNow
        ));

        return new PaymentRedirectResult(paymentId, payUrl, amount);
    }
}
