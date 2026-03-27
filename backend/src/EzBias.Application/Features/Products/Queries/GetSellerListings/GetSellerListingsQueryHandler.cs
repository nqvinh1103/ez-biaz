using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetSellerListings;

public class GetSellerListingsQueryHandler(IProductRepository repo) : IRequestHandler<GetSellerListingsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(GetSellerListingsQuery request, CancellationToken cancellationToken)
    {
        var list = await repo.GetBySellerAsync(request.SellerId, cancellationToken);
        return list.Select(p => new ProductDto(
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
        )).ToList();
    }
}
