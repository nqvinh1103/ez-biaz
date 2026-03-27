using EzBias.Application.Features.Products.Dtos;
using EzBias.Application.Features.Products.Models;

namespace EzBias.Application.Common.Interfaces.Services;

public interface IProductService
{
    Task<IReadOnlyList<ProductDto>> GetProductsAsync(
        string? fandom,
        string? type,
        decimal? minPrice,
        decimal? maxPrice,
        bool? inStockOnly,
        CancellationToken cancellationToken = default);

    Task<ProductDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProductDto>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default);

    Task<ProductDto> CreateListingAsync(string sellerId, CreateListingModel req, CancellationToken cancellationToken = default);

    Task<ProductDto?> UpdateListingAsync(string sellerId, string productId, UpdateListingModel req, CancellationToken cancellationToken = default);

    Task<bool> DeleteListingAsync(string sellerId, string productId, CancellationToken cancellationToken = default);
}
