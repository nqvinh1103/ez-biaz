using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Domain.Entities;

namespace EzBias.Infrastructure.Services;

public class CartService(ICartRepository cartRepo, IProductRepository products) : ICartService
{
    public async Task<IReadOnlyList<CartItem>> GetCartAsync(string ownerId, CancellationToken cancellationToken = default)
    {
        await cartRepo.EnsureOwnerExistsAsync(ownerId, cancellationToken);
        return await cartRepo.GetCartItemsAsync(ownerId, cancellationToken);
    }

    public async Task<(string productId, int qty)> AddToCartAsync(string ownerId, string productId, int qty, CancellationToken cancellationToken = default)
    {
        await cartRepo.EnsureOwnerExistsAsync(ownerId, cancellationToken);

        if (qty < 1)
            throw new ArgumentException("Quantity must be at least 1.");

        // Need product for stock checks
        var product = await products.GetByIdAsync(productId, cancellationToken);
        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        if (product.Stock == 0)
            throw new ArgumentException("Sorry, this item is out of stock.");

        var existing = await cartRepo.GetCartItemAsync(ownerId, productId, cancellationToken);
        if (existing is not null)
        {
            var newQty = existing.Quantity + qty;
            if (newQty > product.Stock)
                throw new ArgumentException($"Only {product.Stock} unit(s) available. You already have {existing.Quantity} in cart.");

            existing.Quantity = newQty;
            await cartRepo.SaveChangesAsync(cancellationToken);
            return (productId, existing.Quantity);
        }

        if (qty > product.Stock)
            throw new ArgumentException($"Only {product.Stock} unit(s) available.");

        await cartRepo.AddCartItemAsync(new CartItem
        {
            UserId = ownerId,
            ProductId = productId,
            Quantity = qty,
            AddedAt = DateTime.UtcNow
        }, cancellationToken);

        return (productId, qty);
    }

    public async Task<(string productId, int qty)> UpdateQtyAsync(string ownerId, string productId, int qty, CancellationToken cancellationToken = default)
    {
        await cartRepo.EnsureOwnerExistsAsync(ownerId, cancellationToken);

        if (qty < 1)
            throw new ArgumentException("Quantity must be at least 1.");

        var product = await products.GetByIdAsync(productId, cancellationToken);
        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        if (qty > product.Stock)
            throw new ArgumentException($"Only {product.Stock} unit(s) available.");

        var item = await cartRepo.GetCartItemAsync(ownerId, productId, cancellationToken);
        if (item is null)
            throw new KeyNotFoundException("Item not found in cart.");

        item.Quantity = qty;
        await cartRepo.SaveChangesAsync(cancellationToken);
        return (productId, qty);
    }

    public async Task RemoveAsync(string ownerId, string productId, CancellationToken cancellationToken = default)
    {
        await cartRepo.EnsureOwnerExistsAsync(ownerId, cancellationToken);

        var item = await cartRepo.GetCartItemAsync(ownerId, productId, cancellationToken);
        if (item is null)
            throw new KeyNotFoundException("Item not found in cart.");

        await cartRepo.RemoveCartItemAsync(item, cancellationToken);
    }

    public async Task ClearAsync(string ownerId, CancellationToken cancellationToken = default)
    {
        await cartRepo.EnsureOwnerExistsAsync(ownerId, cancellationToken);

        var items = await cartRepo.GetCartItemsAsync(ownerId, cancellationToken);
        if (items.Count == 0) return;

        // Note: items are no-tracking due to include; remove needs tracked.
        // Re-query tracked items quickly.
        var tracked = new List<CartItem>();
        foreach (var it in items)
        {
            var t = await cartRepo.GetCartItemAsync(ownerId, it.ProductId, cancellationToken);
            if (t is not null) tracked.Add(t);
        }

        if (tracked.Count > 0)
            await cartRepo.RemoveCartItemsAsync(tracked, cancellationToken);
    }
}
