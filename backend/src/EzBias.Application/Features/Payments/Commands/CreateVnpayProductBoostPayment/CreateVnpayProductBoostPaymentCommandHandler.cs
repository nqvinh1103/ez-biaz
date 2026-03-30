using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Payments.Dtos;
using EzBias.Domain.Entities.Payments;
using MediatR;

namespace EzBias.Application.Features.Payments.Commands.CreateVnpayProductBoostPayment;

public class CreateVnpayProductBoostPaymentCommandHandler(
    IPaymentRepository payments,
    IProductRepository products,
    IProductBoostRepository boosts,
    IVnpayService vnpay) : IRequestHandler<CreateVnpayProductBoostPaymentCommand, PaymentRedirectResult>
{
    public async Task<PaymentRedirectResult> Handle(CreateVnpayProductBoostPaymentCommand request, CancellationToken cancellationToken)
    {
        var productId = (request.Request.ProductId ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(productId))
            throw new ArgumentException("ProductId is required.");

        var product = await products.GetByIdAsync(productId, cancellationToken);
        if (product is null)
            throw new ArgumentException("Product not found.");

        if (!string.Equals(product.SellerId, request.UserId, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("You can only boost your own listing.");

        if (product.IsAuction)
            throw new ArgumentException("Auction item cannot be boosted as listing.");

        if (product.Stock <= 0)
            throw new ArgumentException("Only active listings can be boosted.");

        var now = DateTime.UtcNow;
        var hasActiveBoost = await boosts.HasActiveBoostAsync(productId, now, cancellationToken);

        if (hasActiveBoost)
            throw new ArgumentException("This listing is already boosted.");

        const decimal amount = 19000m; // 1-day boost demo price (VND)
        var amountVnd = (long)decimal.Round(amount, 0);

        var paymentId = await payments.NextPaymentIdAsync(cancellationToken);
        var payment = new Payment
        {
            Id = paymentId,
            Provider = "vnpay",
            Type = "product_boost",
            UserId = request.UserId,
            Reference = productId,
            Amount = amount,
            Status = "pending",
            CreatedAt = now
        };

        await payments.AddAsync(payment, cancellationToken);
        await payments.SaveChangesAsync(cancellationToken);

        var payUrl = vnpay.CreatePaymentUrl(new VnpayCreateRequest(
            TxnRef: paymentId,
            OrderInfo: $"Boost listing {productId}",
            AmountVnd: amountVnd,
            IpAddress: request.IpAddress,
            CreateDateUtc: DateTime.UtcNow
        ));

        return new PaymentRedirectResult(paymentId, payUrl, amount);
    }
}
