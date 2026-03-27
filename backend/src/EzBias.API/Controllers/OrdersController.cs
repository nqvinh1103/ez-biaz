using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(EzBiasDbContext db) : ControllerBase
{
    /// <summary>
    /// Match mock: getOrders(userId)
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OrderDto>>>> GetOrders([FromRoute] string userId)
    {
        var orders = await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto(
                o.Id,
                o.UserId,
                o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.Quantity, i.Price)).ToList(),
                o.ShippingFee,
                o.Total,
                o.Status,
                o.Payment,
                o.Address,
                o.CreatedAt.ToString("yyyy-MM-dd")
            ))
            .ToListAsync();

        return ApiResponse<IReadOnlyList<OrderDto>>.Ok(orders);
    }

    /// <summary>
    /// Match mock: checkout(userId, shippingInfo, paymentMethod, reactCartItems?)
    /// 
    /// Request body:
    /// {
    ///   userId: string,
    ///   shippingInfo: { fullName,email,address,city,zip,phone },
    ///   paymentMethod: string,
    ///   items?: [{ productId, name, price, qty }]
    /// }
    /// If items omitted, uses server-side cart for the user.
    /// </summary>
    [HttpPost("checkout")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Checkout([FromBody] CheckoutRequest req)
    {
        var missing = MissingShippingFields(req.ShippingInfo);
        if (missing.Count > 0)
            return BadRequest(ApiResponse<OrderDto>.Fail($"Missing shipping fields: {string.Join(", ", missing)}."));

        if (string.IsNullOrWhiteSpace(req.PaymentMethod))
            return BadRequest(ApiResponse<OrderDto>.Fail("Please select a payment method."));

        // Get order items from request OR from cart
        var orderItems = new List<(string productId, string name, int qty, decimal price)>();

        if (req.Items is { Count: > 0 })
        {
            foreach (var item in req.Items)
            {
                if (item.Qty < 1) return BadRequest(ApiResponse<OrderDto>.Fail("Quantity must be at least 1."));
                orderItems.Add((item.ProductId, item.Name, item.Qty, item.Price));
            }
        }
        else
        {
            var cartItems = await db.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == req.UserId)
                .ToListAsync();

            if (cartItems.Count == 0)
                return BadRequest(ApiResponse<OrderDto>.Fail("Your cart is empty. Add items before checking out."));

            foreach (var ci in cartItems)
            {
                if (ci.Product is null)
                    return BadRequest(ApiResponse<OrderDto>.Fail("One or more items are no longer available."));

                orderItems.Add((ci.ProductId, ci.Product.Name, ci.Quantity, ci.Product.Price));
            }
        }

        if (orderItems.Count == 0)
            return BadRequest(ApiResponse<OrderDto>.Fail("Your cart is empty. Add items before checking out."));

        // Validate stock and deduct stock
        var productIds = orderItems.Select(i => i.productId).Distinct().ToList();
        var products = await db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

        foreach (var (productId, _, qty, _) in orderItems)
        {
            var p = products.FirstOrDefault(x => x.Id == productId);
            if (p is null) return BadRequest(ApiResponse<OrderDto>.Fail("One or more items are no longer available."));
            if (p.Stock < qty) return BadRequest(ApiResponse<OrderDto>.Fail("One or more items are no longer available."));
        }

        foreach (var (productId, _, qty, _) in orderItems)
        {
            var p = products.First(x => x.Id == productId);
            p.Stock -= qty;
        }

        var subtotal = orderItems.Sum(i => i.price * i.qty);
        var shippingFee = 5.99m;

        var nextOrderId = await NextIdAsync("o", db.Orders.Select(o => o.Id));

        var order = new Order
        {
            Id = nextOrderId,
            UserId = req.UserId,
            ShippingFee = shippingFee,
            Total = decimal.Round(subtotal + shippingFee, 2),
            Status = "pending",
            Payment = req.PaymentMethod,
            Address = $"{req.ShippingInfo.Address}, {req.ShippingInfo.City}",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            Items = orderItems.Select(i => new OrderItem
            {
                ProductId = i.productId,
                Name = i.name,
                Quantity = i.qty,
                Price = i.price
            }).ToList()
        };

        db.Orders.Add(order);

        // Clear server-side cart if we used it
        if (req.Items is null || req.Items.Count == 0)
        {
            var cart = await db.CartItems.Where(c => c.UserId == req.UserId).ToListAsync();
            db.CartItems.RemoveRange(cart);
        }

        await db.SaveChangesAsync();

        var dto = new OrderDto(
            order.Id,
            order.UserId,
            order.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.Quantity, i.Price)).ToList(),
            order.ShippingFee,
            order.Total,
            order.Status,
            order.Payment,
            order.Address,
            order.CreatedAt.ToString("yyyy-MM-dd")
        );

        return ApiResponse<OrderDto>.Ok(dto, "Order placed successfully! Thank you for your purchase.");
    }

    private static List<string> MissingShippingFields(ShippingInfo info)
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

    private static async Task<string> NextIdAsync(string prefix, IQueryable<string> ids)
    {
        var list = await ids.ToListAsync();
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[prefix.Length..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return prefix + (max + 1);
    }
}
