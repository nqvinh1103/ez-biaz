using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Features.Orders.Commands.Checkout;
using EzBias.Application.Features.Orders.Models;
using EzBias.Contracts.Features.Payments.Dtos;
using EzBias.Domain.Entities.Payments;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayOrderPayment;

public class CreateVnpayOrderPaymentCommandHandler(
    IMediator mediator,
    IPaymentRepository payments,
    IVnpayService vnpay) : IRequestHandler<CreateVnpayOrderPaymentCommand, PaymentRedirectResult>
{
    public async Task<PaymentRedirectResult> Handle(CreateVnpayOrderPaymentCommand request, CancellationToken cancellationToken)
    {
        var checkout = request.Request.Checkout;

        var model = new CheckoutModel(
            checkout.UserId,
            new ShippingInfoModel(
                checkout.ShippingInfo.FullName,
                checkout.ShippingInfo.Email,
                checkout.ShippingInfo.Address,
                checkout.ShippingInfo.City,
                checkout.ShippingInfo.Zip,
                checkout.ShippingInfo.Phone
            ),
            "vnpay",
            checkout.Items?.Select(i => new CheckoutItemModel(i.ProductId, i.Name, i.Price, i.Qty)).ToList()
        );

        var checkoutResult = await mediator.Send(new CheckoutCommand(model), cancellationToken);
        var orderIds = checkoutResult.Orders.Select(o => o.Id).ToList();
        var amount = checkoutResult.Orders.Sum(o => o.Total);

        // VNPay needs integer VND
        var amountVnd = (long)decimal.Round(amount, 0);

        var paymentId = await payments.NextPaymentIdAsync(cancellationToken);
        var payment = new Payment
        {
            Id = paymentId,
            Provider = "vnpay",
            Type = "order",
            UserId = checkout.UserId,
            Amount = amount,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            Orders = orderIds.Select(oid => new PaymentOrder { PaymentId = paymentId, OrderId = oid }).ToList()
        };

        await payments.AddAsync(payment, cancellationToken);
        await payments.SaveChangesAsync(cancellationToken);

        var payUrl = vnpay.CreatePaymentUrl(new VnpayCreateRequest(
            TxnRef: paymentId,
            OrderInfo: $"Thanh toan don hang ({orderIds.Count} orders)",
            AmountVnd: amountVnd,
            IpAddress: request.IpAddress,
            CreateDateUtc: DateTime.UtcNow
        ));

        return new PaymentRedirectResult(paymentId, payUrl, amount);
    }
}
