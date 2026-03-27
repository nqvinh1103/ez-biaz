using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetProductById;

public class GetProductByIdQueryHandler(IProductRepository repo) : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var p = await repo.GetByIdAsync(request.Id, cancellationToken);
        if (p is null) return null;
        return new ProductDto(
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
}
