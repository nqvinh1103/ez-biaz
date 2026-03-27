using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetProductsAsync(
        string? fandom,
        string? type,
        decimal? minPrice,
        decimal? maxPrice,
        bool? inStockOnly,
        CancellationToken cancellationToken = default);

    Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Product>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default);

    Task<string> NextIdAsync(CancellationToken cancellationToken = default);

    Task AddAsync(Product product, CancellationToken cancellationToken = default);

    // Tracking reads for update/delete
    Task<Product?> GetTrackedByIdAsync(string id, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);

    Task DeleteAsync(Product product, CancellationToken cancellationToken = default);
}
