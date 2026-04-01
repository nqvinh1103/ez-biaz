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
        bool? boostedFirst,
        CancellationToken cancellationToken = default)
    {
        var q = db.Products.AsNoTracking().Where(p => !p.IsAuction && p.Stock > 0).AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(p => p.Fandom.ToLower() == fandom.ToLower());

        if (!string.IsNullOrWhiteSpace(type))
            q = q.Where(p => p.Type.ToLower() == type.ToLower());

        if (minPrice is not null)
            q = q.Where(p => p.Price >= minPrice.Value);

        if (maxPrice is not null)
            q = q.Where(p => p.Price <= maxPrice.Value);

        // stock > 0 is already enforced by default; keep flag for backward compatibility
        if (inStockOnly == true)
            q = q.Where(p => p.Stock > 0);

        var now = DateTime.UtcNow;

        var activeBoosts = db.ProductBoosts.AsNoTracking()
            .Where(b => b.Status == "active" && b.EndsAt > now);

        var withBoost = q.GroupJoin(
            activeBoosts,
            p => p.Id,
            b => b.ProductId,
            (p, bs) => new { p, boost = bs.OrderByDescending(x => x.EndsAt).FirstOrDefault() }
        );

        if (boostedFirst == true)
        {
            withBoost = withBoost
                .OrderByDescending(x => x.boost != null)
                .ThenByDescending(x => x.p.CreatedAt)
                .ThenByDescending(x => x.p.Id.Length)
                .ThenByDescending(x => x.p.Id);
        }
        else
        {
            withBoost = withBoost
                .OrderByDescending(x => x.p.CreatedAt)
                .ThenByDescending(x => x.p.Id.Length)
                .ThenByDescending(x => x.p.Id);
        }

        return await withBoost
            .Select(x => new ProductDto(
                x.p.Id,
                x.p.Fandom,
                x.p.Artist,
                x.p.Name,
                x.p.Type,
                x.p.Condition,
                x.p.Price,
                x.p.Stock,
                x.p.SellerId,
                x.p.Image,
                x.p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
                x.p.Description,
                x.p.CreatedAt.ToString("yyyy-MM-dd"),
                x.p.IsAuction,
                x.boost != null,
                x.boost != null ? x.boost.EndsAt.ToString("o") : null,
                null,
                null
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDto?> GetByIdDtoAsync(string id, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var row = await db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new
            {
                Product = p,
                Boost = db.ProductBoosts.AsNoTracking()
                    .Where(b => b.ProductId == p.Id && b.Status == "active" && b.EndsAt > now)
                    .OrderByDescending(b => b.EndsAt)
                    .FirstOrDefault(),
                Seller = db.Users.AsNoTracking()
                    .Where(u => u.Id == p.SellerId)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.FullName,
                        u.Avatar,
                        u.JoinedAt
                    })
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null) return null;

        var ratingRows = await db.Ratings.AsNoTracking()
            .Where(r => r.SellerId == row.Product.SellerId)
            .Select(r => r.SellerRating)
            .ToListAsync(cancellationToken);

        var totalReviews = ratingRows.Count;
        var average = totalReviews == 0 ? 0m : Math.Round((decimal)ratingRows.Average(), 1);

        var breakdown = new Dictionary<int, int>
        {
            [1] = 0,
            [2] = 0,
            [3] = 0,
            [4] = 0,
            [5] = 0
        };

        foreach (var star in ratingRows.Where(x => x is >= 1 and <= 5))
            breakdown[star]++;

        var sellerDto = row.Seller is null
            ? null
            : new SellerSummaryDto(
                row.Seller.Id,
                row.Seller.Username,
                row.Seller.FullName,
                row.Seller.Avatar,
                row.Seller.JoinedAt.ToString("yyyy-MM-dd")
            );

        var sellerRatingDto = new SellerRatingSummaryDto(average, totalReviews, breakdown);

        return new ProductDto(
            row.Product.Id,
            row.Product.Fandom,
            row.Product.Artist,
            row.Product.Name,
            row.Product.Type,
            row.Product.Condition,
            row.Product.Price,
            row.Product.Stock,
            row.Product.SellerId,
            row.Product.Image,
            row.Product.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
            row.Product.Description,
            row.Product.CreatedAt.ToString("yyyy-MM-dd"),
            row.Product.IsAuction,
            row.Boost != null,
            row.Boost != null ? row.Boost.EndsAt.ToString("o") : null,
            sellerDto,
            sellerRatingDto
        );
    }

    public async Task<IReadOnlyList<ProductDto>> GetBySellerDtoAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var activeBoosts = db.ProductBoosts.AsNoTracking()
            .Where(b => b.Status == "active" && b.EndsAt > now);

        return await db.Products.AsNoTracking()
            .Where(p => p.SellerId == sellerId)
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id.Length)
            .ThenByDescending(p => p.Id)
            .GroupJoin(
                activeBoosts,
                p => p.Id,
                b => b.ProductId,
                (p, bs) => new { p, boost = bs.OrderByDescending(x => x.EndsAt).FirstOrDefault() }
            )
            .Select(x => new ProductDto(
                x.p.Id,
                x.p.Fandom,
                x.p.Artist,
                x.p.Name,
                x.p.Type,
                x.p.Condition,
                x.p.Price,
                x.p.Stock,
                x.p.SellerId,
                x.p.Image,
                x.p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
                x.p.Description,
                x.p.CreatedAt.ToString("yyyy-MM-dd"),
                x.p.IsAuction,
                x.boost != null,
                x.boost != null ? x.boost.EndsAt.ToString("o") : null,
                null,
                null
            ))
            .ToListAsync(cancellationToken);
    }

    public Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<int> CountActiveListingsBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
        => db.Products.AsNoTracking()
            .Where(p => p.SellerId == sellerId && !p.IsAuction && p.Stock > 0)
            .CountAsync(cancellationToken);

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
