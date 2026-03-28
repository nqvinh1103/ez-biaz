using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Features.Orders.Models;
using EzBias.Contracts.Features.Orders.Dtos;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Orders.Commands.Checkout;

public class CheckoutCommandHandler(IOrderRepository repo) : IRequestHandler<CheckoutCommand, OrderDto>
{
    public async Task<OrderDto> Handle(CheckoutCommand request, CancellationToken cancellationToken)
    {
        var model = request.Model;

        var missing = MissingShippingFields(model.ShippingInfo);
        if (missing.Count > 0)
            throw new ArgumentException($"Missing shipping fields: {string.Join(", ", missing)}.");

        if (string.IsNullOrWhiteSpace(model.PaymentMethod))
            throw new ArgumentException("Please select a payment method.");

        var orderItems = new List<(string productId, string name, int qty, decimal price, string image)>();

        if (model.Items is { Count: > 0 })
        {
            foreach (var item in model.Items)
            {
                if (item.Qty < 1) throw new ArgumentException("Quantity must be at least 1.");
                orderItems.Add((item.ProductId, item.Name, item.Qty, item.Price, string.Empty));
            }
        }
        else
        {
            var cartItems = await repo.GetCartItemsForCheckoutAsync(model.UserId, cancellationToken);
            if (cartItems.Count == 0)
                throw new ArgumentException("Your cart is empty. Add items before checking out.");

            foreach (var ci in cartItems)
            {
                if (ci.Product is null)
                    throw new ArgumentException("One or more items are no longer available.");

                orderItems.Add((ci.ProductId, ci.Product.Name, ci.Quantity, ci.Product.Price, ci.Product.Image));
            }
        }

        if (orderItems.Count == 0)
            throw new ArgumentException("Your cart is empty. Add items before checking out.");

        var productIds = orderItems.Select(i => i.productId).Distinct().ToList();
        var products = await repo.GetProductsForUpdateAsync(productIds, cancellationToken);

        foreach (var (productId, _, qty, _, _) in orderItems)
        {
            var p = products.FirstOrDefault(x => x.Id == productId);
            if (p is null) throw new ArgumentException("One or more items are no longer available.");
            if (p.Stock < qty) throw new ArgumentException("One or more items are no longer available.");
        }

        foreach (var (productId, _, qty, _, _) in orderItems)
        {
            var p = products.First(x => x.Id == productId);
            p.Stock -= qty;
        }

        // Fill missing images (when checkout items provided by client)
        foreach (var idx in Enumerable.Range(0, orderItems.Count))
        {
            var it = orderItems[idx];
            if (!string.IsNullOrWhiteSpace(it.image)) continue;
            var p = products.FirstOrDefault(x => x.Id == it.productId);
            if (p is null) continue;
            orderItems[idx] = (it.productId, it.name, it.qty, it.price, p.Image);
        }

        var subtotal = orderItems.Sum(i => i.price * i.qty);
        var shippingFee = 5.99m;
        var nextOrderId = await repo.NextOrderIdAsync(cancellationToken);

        var order = new Order
        {
            Id = nextOrderId,
            UserId = model.UserId,
            ShippingFee = shippingFee,
            Total = decimal.Round(subtotal + shippingFee, 2),
            Status = "pending",
            Payment = model.PaymentMethod,
            Address = $"{model.ShippingInfo.Address}, {model.ShippingInfo.City}",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            Items = orderItems.Select(i => new OrderItem
            {
                ProductId = i.productId,
                Name = i.name,
                Quantity = i.qty,
                Price = i.price
            }).ToList()
        };

        await repo.ExecuteInTransactionAsync(async ct =>
        {
            await repo.AddOrderAsync(order, ct);

            if (model.Items is null || model.Items.Count == 0)
                await repo.ClearCartAsync(model.UserId, ct);

            await repo.SaveChangesAsync(ct);
        }, cancellationToken);

        return new OrderDto(
            order.Id,
            order.UserId,
            order.Items.Select(i => new OrderItemDto(
                i.ProductId,
                i.Name,
                i.Quantity,
                i.Price,
                orderItems.FirstOrDefault(x => x.productId == i.ProductId).image
            )).ToList(),
            order.ShippingFee,
            order.Total,
            order.Status,
            order.Payment,
            order.Address,
            order.CreatedAt.ToString("yyyy-MM-dd")
        );
    }

    private static List<string> MissingShippingFields(ShippingInfoModel info)
    {
        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(info.FullName)) missing.Add("fullName");
        if (string.IsNullOrWhiteSpace(info.Email)) missing.Add("email");
        if (string.IsNullOrWhiteSpace(info.Address)) missing.Add("address");
        if (string.IsNullOrWhiteSpace(info.City)) missing.Add("city");
        if (string.IsNullOrWhiteSpace(info.Zip)) missing.Add("zip");
        if (string.IsNullOrWhiteSpace(info.Phone)) missing.Add("phone");
        return missing;
    }
}
