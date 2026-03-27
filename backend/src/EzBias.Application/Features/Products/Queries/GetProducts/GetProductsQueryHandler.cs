using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetProducts;

public class GetProductsQueryHandler(IProductRepository repo) : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var list = await repo.GetProductsAsync(request.Fandom, request.Type, request.MinPrice, request.MaxPrice, request.InStockOnly, cancellationToken);
        return list.Select(ToDto).ToList();
    }

    private static ProductDto ToDto(EzBias.Domain.Entities.Product p) => new(
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
