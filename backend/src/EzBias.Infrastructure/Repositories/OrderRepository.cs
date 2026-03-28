using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class OrderRepository(EzBiasDbContext db) : IOrderRepository
{
    private static OrderDto ToDto(
        dynamic o,
        IReadOnlyDictionary<string, string> imageMap)
    {
        // o is an anonymous shape produced by our queries below.
        return new OrderDto(
            o.Id,
            o.UserId,
            o.SellerId,
            ((IEnumerable<dynamic>)o.Items).Select(i => new OrderItemDto(
                (string)i.ProductId,
                (string)i.Name,
                (int)i.Quantity,
                (decimal)i.Price,
                imageMap.TryGetValue((string)i.ProductId, out var img) ? img : string.Empty
            )).ToList(),
            (decimal)o.ShippingFee,
            (decimal)o.Total,
            (string)o.Status,
            (string)o.Payment,
            (string)o.Address,
            ((DateOnly)o.CreatedAt).ToString("yyyy-MM-dd"),
            (string?)o.Carrier,
            (string?)o.TrackingNumber,
            ((DateTime?)o.ShippedAt)?.ToString("o"),
            ((DateTime?)o.DeliveredAt)?.ToString("o")
        );
    }

    public async Task<IReadOnlyList<SoldItemDto>> GetSoldItemsDtoAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        var rows = await (
            from oi in db.OrderItems.AsNoTracking()
            join o in db.Orders.AsNoTracking() on oi.OrderId equals o.Id
            join p in db.Products.AsNoTracking() on oi.ProductId equals p.Id
            where p.SellerId == sellerId
            orderby o.CreatedAt descending
            select new SoldItemDto(
                o.Id,
                o.UserId,
                oi.ProductId,
                oi.Name,
                oi.Quantity,
                oi.Price,
                p.Image,
                o.CreatedAt.ToString("yyyy-MM-dd")
            )
        ).ToListAsync(cancellationToken);

        return rows;
    }

    public async Task<IReadOnlyList<OrderDto>> GetOrdersDtoAsync(string userId, CancellationToken cancellationToken = default)
    {
        var orders = await db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.UserId,
                o.SellerId,
                o.ShippingFee,
                o.Total,
                o.Status,
                o.Payment,
                o.Address,
                o.CreatedAt,
                o.Carrier,
                o.TrackingNumber,
                o.ShippedAt,
                o.DeliveredAt,
                Items = o.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new { i.ProductId, i.Name, i.Quantity, i.Price })
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        var imageMap = await LoadImageMapAsync(orders.SelectMany(o => o.Items.Select(i => i.ProductId)).Distinct().ToList(), cancellationToken);
        return orders.Select(o => ToDto(o, imageMap)).ToList();
    }

    public async Task<IReadOnlyList<OrderDto>> GetSellerOrdersDtoAsync(string sellerId, string? status, CancellationToken cancellationToken = default)
    {
        var q = db.Orders.AsNoTracking().Where(o => o.SellerId == sellerId);
        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(o => o.Status == status);

        var orders = await q
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.UserId,
                o.SellerId,
                o.ShippingFee,
                o.Total,
                o.Status,
                o.Payment,
                o.Address,
                o.CreatedAt,
                o.Carrier,
                o.TrackingNumber,
                o.ShippedAt,
                o.DeliveredAt,
                Items = o.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new { i.ProductId, i.Name, i.Quantity, i.Price })
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        var imageMap = await LoadImageMapAsync(orders.SelectMany(o => o.Items.Select(i => i.ProductId)).Distinct().ToList(), cancellationToken);
        return orders.Select(o => ToDto(o, imageMap)).ToList();
    }

    public async Task<OrderDto?> GetOrderDtoByIdAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var o = await db.Orders.AsNoTracking()
            .Where(x => x.Id == orderId)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.SellerId,
                x.ShippingFee,
                x.Total,
                x.Status,
                x.Payment,
                x.Address,
                x.CreatedAt,
                x.Carrier,
                x.TrackingNumber,
                x.ShippedAt,
                x.DeliveredAt,
                Items = x.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new { i.ProductId, i.Name, i.Quantity, i.Price })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (o is null) return null;

        var imageMap = await LoadImageMapAsync(o.Items.Select(i => i.ProductId).Distinct().ToList(), cancellationToken);
        return ToDto(o, imageMap);
    }

    public Task<Order?> GetTrackedByIdAsync(string orderId, CancellationToken cancellationToken = default)
        => db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

    public async Task<IReadOnlyList<string>> NextOrderIdsAsync(int count, CancellationToken cancellationToken = default)
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

        var ids = new List<string>(count);
        for (var i = 1; i <= count; i++)
            ids.Add("o" + (max + i));

        return ids;
    }

    private async Task<Dictionary<string, string>> LoadImageMapAsync(List<string> productIds, CancellationToken cancellationToken)
    {
        if (productIds.Count == 0) return new Dictionary<string, string>();

        return await db.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Image })
            .ToDictionaryAsync(x => x.Id, x => x.Image, cancellationToken);
    }

    // (removed) entity-returning query method; use GetOrdersDtoAsync for reads

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
    }

    public Task AddOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        db.Orders.Add(order);
        return Task.CompletedTask;
    }

    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await action(cancellationToken);
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
