using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Application.Products.Models;
using EzBias.Domain.Entities;

namespace EzBias.Infrastructure.Services;

public class ProductService(IProductRepository repo, IUserRepository users) : IProductService
{
    public Task<IReadOnlyList<Product>> GetProductsAsync(
        string? fandom,
        string? type,
        decimal? minPrice,
        decimal? maxPrice,
        bool? inStockOnly,
        CancellationToken cancellationToken = default)
        => repo.GetProductsAsync(fandom, type, minPrice, maxPrice, inStockOnly, cancellationToken);

    public Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => repo.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<Product>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
        => repo.GetBySellerAsync(sellerId, cancellationToken);

    public async Task<Product> CreateListingAsync(string sellerId, CreateListingModel req, CancellationToken cancellationToken = default)
    {
        // Validate like mock
        if (string.IsNullOrWhiteSpace(req.Name))
            throw new ArgumentException("Product name is required.");
        if (string.IsNullOrWhiteSpace(req.Condition))
            throw new ArgumentException("Please select the item condition.");
        if (req.Price <= 0)
            throw new ArgumentException("Please enter a valid price greater than $0.");
        if (string.IsNullOrWhiteSpace(req.Fandom))
            throw new ArgumentException("Please specify the fandom / group.");
        if (req.ItemTypes is null || req.ItemTypes.Count == 0)
            throw new ArgumentException("Please select at least one item type.");

        var user = await users.GetByIdAsync(sellerId, cancellationToken);
        if (user is null)
            throw new ArgumentException("You must be logged in to create a listing.");

        var nextId = await repo.NextIdAsync(cancellationToken);
        var name = req.Name.Trim();
        var fandom = req.Fandom.Trim();

        var product = new Product
        {
            Id = nextId,
            Fandom = fandom,
            Artist = fandom,
            Name = name,
            Type = req.ItemTypes[0],
            Condition = req.Condition,
            Price = decimal.Round(req.Price, 2),
            Stock = 1,
            SellerId = sellerId,
            Image = "https://placehold.co/300x300/e8e0f7/7c5cbf?text=" + Uri.EscapeDataString(name.Length > 12 ? name[..12] : name),
            Description = req.Description ?? string.Empty,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        await repo.AddAsync(product, cancellationToken);
        return product;
    }

    public async Task<Product?> UpdateListingAsync(string sellerId, string productId, UpdateListingModel req, CancellationToken cancellationToken = default)
    {
        var existing = await repo.GetTrackedByIdAsync(productId, cancellationToken);
        if (existing is null) return null;
        if (existing.SellerId != sellerId) throw new UnauthorizedAccessException();

        if (req.Name is not null) existing.Name = req.Name;
        if (req.Description is not null) existing.Description = req.Description;
        if (req.Condition is not null) existing.Condition = req.Condition;
        if (req.Price is not null) existing.Price = decimal.Round(req.Price.Value, 2);
        if (req.Stock is not null) existing.Stock = req.Stock.Value;
        existing.UpdatedAt = DateTime.UtcNow;

        await repo.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<bool> DeleteListingAsync(string sellerId, string productId, CancellationToken cancellationToken = default)
    {
        var existing = await repo.GetTrackedByIdAsync(productId, cancellationToken);
        if (existing is null) return false;
        if (existing.SellerId != sellerId) throw new UnauthorizedAccessException();

        await repo.DeleteAsync(existing, cancellationToken);
        return true;
    }
}
