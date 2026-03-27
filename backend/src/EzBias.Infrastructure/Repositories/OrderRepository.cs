using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class OrderRepository(EzBiasDbContext db) : IOrderRepository
{
    public async Task<IReadOnlyList<OrderDto>> GetOrdersDtoAsync(string userId, CancellationToken cancellationToken = default)
        => await db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto(
                o.Id,
                o.UserId,
                o.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new OrderItemDto(i.ProductId, i.Name, i.Quantity, i.Price))
                    .ToList(),
                o.ShippingFee,
                o.Total,
                o.Status,
                o.Payment,
                o.Address,
                o.CreatedAt.ToString("yyyy-MM-dd")
            ))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Order>> GetOrdersAsync(string userId, CancellationToken cancellationToken = default)
        => await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<string> NextOrderIdAsync(CancellationToken cancellationToken = default)
    {
        var list = await db.Orders.AsNoTracking().Select(o => o.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith("o", StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[1..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return "o" + (max + 1);
    }

    public async Task<IReadOnlyList<Product>> GetProductsForUpdateAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default)
        => await db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CartItem>> GetCartItemsForCheckoutAsync(string ownerId, CancellationToken cancellationToken = default)
        => await db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == ownerId)
            .ToListAsync(cancellationToken);

    public async Task ClearCartAsync(string ownerId, CancellationToken cancellationToken = default)
    {
        var cart = await db.CartItems.Where(c => c.UserId == ownerId).ToListAsync(cancellationToken);
        db.CartItems.RemoveRange(cart);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task AddOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
