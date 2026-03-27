using EzBias.Application.Products.Models;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Services;

public interface IProductService
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

    Task<Product> CreateListingAsync(string sellerId, CreateListingModel req, CancellationToken cancellationToken = default);

    Task<Product?> UpdateListingAsync(string sellerId, string productId, UpdateListingModel req, CancellationToken cancellationToken = default);

    Task<bool> DeleteListingAsync(string sellerId, string productId, CancellationToken cancellationToken = default);
}
