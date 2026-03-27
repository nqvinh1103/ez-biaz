using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class ProductRepository(EzBiasDbContext db) : IProductRepository
{
    public async Task<IReadOnlyList<ProductDto>> GetProductsDtoAsync(
        string? fandom,
        string? type,
        decimal? minPrice,
        decimal? maxPrice,
        bool? inStockOnly,
        CancellationToken cancellationToken = default)
    {
        var q = db.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(p => p.Fandom.ToLower() == fandom.ToLower());

        if (!string.IsNullOrWhiteSpace(type))
            q = q.Where(p => p.Type.ToLower() == type.ToLower());

        if (minPrice is not null)
            q = q.Where(p => p.Price >= minPrice.Value);

        if (maxPrice is not null)
            q = q.Where(p => p.Price <= maxPrice.Value);

        if (inStockOnly == true)
            q = q.Where(p => p.Stock > 0);

        return await q
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
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
            ))
            .ToListAsync(cancellationToken);
    }

    public Task<ProductDto?> GetByIdDtoAsync(string id, CancellationToken cancellationToken = default)
        => db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(
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
            ))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductDto>> GetBySellerDtoAsync(string sellerId, CancellationToken cancellationToken = default)
        => await db.Products.AsNoTracking()
            .Where(p => p.SellerId == sellerId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
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
            ))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Product>> GetProductsAsync(
        string? fandom,
        string? type,
        decimal? minPrice,
        decimal? maxPrice,
        bool? inStockOnly,
        CancellationToken cancellationToken = default)
    {
        var q = db.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(p => p.Fandom.ToLower() == fandom.ToLower());

        if (!string.IsNullOrWhiteSpace(type))
            q = q.Where(p => p.Type.ToLower() == type.ToLower());

        if (minPrice is not null)
            q = q.Where(p => p.Price >= minPrice.Value);

        if (maxPrice is not null)
            q = q.Where(p => p.Price <= maxPrice.Value);

        if (inStockOnly == true)
            q = q.Where(p => p.Stock > 0);

        return await q.OrderByDescending(p => p.CreatedAt).ToListAsync(cancellationToken);
    }

    public Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Product>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
        => await db.Products.AsNoTracking()
            .Where(p => p.SellerId == sellerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<string> NextIdAsync(CancellationToken cancellationToken = default)
    {
        var list = await db.Products.AsNoTracking().Select(p => p.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith("p", StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[1..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return "p" + (max + 1);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);
    }

    public Task<Product?> GetTrackedByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Product product, CancellationToken cancellationToken = default)
    {
        db.Products.Remove(product);
        await db.SaveChangesAsync(cancellationToken);
    }
}
