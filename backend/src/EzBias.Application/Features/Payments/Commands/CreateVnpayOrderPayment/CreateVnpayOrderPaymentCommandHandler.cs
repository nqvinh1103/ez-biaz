using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Payments.Dtos;
using EzBias.Domain.Entities.Payments;
using MediatR;
using System.Text.Json;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayOrderPayment;

public class CreateVnpayOrderPaymentCommandHandler(
    IPaymentRepository payments,
    ICartRepository carts,
    IVnpayService vnpay) : IRequestHandler<CreateVnpayOrderPaymentCommand, PaymentRedirectResult>
{
    public async Task<PaymentRedirectResult> Handle(CreateVnpayOrderPaymentCommand request, CancellationToken cancellationToken)
    {
        var checkout = request.Request.Checkout;

        // IMPORTANT (Option A): do NOT create orders or decrement stock here.
        // Only create a pending payment + redirect URL.

        var cart = await carts.GetCartDtoAsync(checkout.UserId, cancellationToken);
        if (cart.Count == 0)
            throw new ArgumentException("Your cart is empty. Add items before checking out.");

        var subtotal = cart.Sum(i => i.Price * i.Qty);
        var amount = decimal.Round(subtotal, 2);
        var amountVnd = (long)decimal.Round(amount, 0);

        var paymentId = await payments.NextPaymentIdAsync(cancellationToken);
        var payload = JsonSerializer.Serialize(new
        {
            checkout.ShippingInfo,
            checkout.PaymentMethod
        });

        var payment = new Payment
        {
            Id = paymentId,
            Provider = "vnpay",
            Type = "order",
            UserId = checkout.UserId,
            Amount = amount,
            Status = "pending",
            Payload = payload,
            CreatedAt = DateTime.UtcNow
        };

        await payments.AddAsync(payment, cancellationToken);
        await payments.SaveChangesAsync(cancellationToken);

        var payUrl = vnpay.CreatePaymentUrl(new VnpayCreateRequest(
            TxnRef: paymentId,
            OrderInfo: $"Thanh toan don hang {paymentId}",
            AmountVnd: amountVnd,
            IpAddress: request.IpAddress,
            CreateDateUtc: DateTime.UtcNow
        ));

        return new PaymentRedirectResult(paymentId, payUrl, amount);
    }
}
