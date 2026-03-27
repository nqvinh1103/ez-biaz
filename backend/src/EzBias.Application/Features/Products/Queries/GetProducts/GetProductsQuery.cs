using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetProducts;

public record GetProductsQuery(
    string? Fandom,
    string? Type,
    decimal? MinPrice,
    decimal? MaxPrice,
    bool? InStockOnly
) : IRequest<IReadOnlyList<ProductDto>>;
