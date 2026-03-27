using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetProducts;

public class GetProductsQueryHandler(IProductRepository repo) : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    public Task<IReadOnlyList<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        => repo.GetProductsDtoAsync(request.Fandom, request.Type, request.MinPrice, request.MaxPrice, request.InStockOnly, cancellationToken);
}
