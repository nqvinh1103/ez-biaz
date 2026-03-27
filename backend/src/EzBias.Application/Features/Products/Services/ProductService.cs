using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Contracts.Features.Products.Dtos;
using EzBias.Application.Features.Products.Models;
using EzBias.Domain.Entities;

namespace EzBias.Application.Features.Products.Services;

public class ProductService(IProductRepository repo, IUserRepository users) : IProductService
{
    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync(
        string? fandom,
        string? type,
        decimal? minPrice,
        decimal? maxPrice,
        bool? inStockOnly,
        CancellationToken cancellationToken = default)
    {
        var list = await repo.GetProductsAsync(fandom, type, minPrice, maxPrice, inStockOnly, cancellationToken);
        return list.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var p = await repo.GetByIdAsync(id, cancellationToken);
        return p is null ? null : ToDto(p);
    }

    public async Task<IReadOnlyList<ProductDto>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        var list = await repo.GetBySellerAsync(sellerId, cancellationToken);
        return list.Select(ToDto).ToList();
    }

    public async Task<ProductDto> CreateListingAsync(string sellerId, CreateListingModel req, CancellationToken cancellationToken = default)
    {
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
        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateListingAsync(string sellerId, string productId, UpdateListingModel req, CancellationToken cancellationToken = default)
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
        return ToDto(existing);
    }

    public async Task<bool> DeleteListingAsync(string sellerId, string productId, CancellationToken cancellationToken = default)
    {
        var existing = await repo.GetTrackedByIdAsync(productId, cancellationToken);
        if (existing is null) return false;
        if (existing.SellerId != sellerId) throw new UnauthorizedAccessException();

        await repo.DeleteAsync(existing, cancellationToken);
        return true;
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id,
        p.Fandom,
        p.Artist,
        p.Name,
        p.Type,
        p.Condition,
        p.Price,
        p.Stock,
        p.SellerId,
        p.Image,
        p.Description,
        p.CreatedAt.ToString("yyyy-MM-dd")
    );
}
