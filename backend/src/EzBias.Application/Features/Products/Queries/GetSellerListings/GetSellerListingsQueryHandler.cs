using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetSellerListings;

public class GetSellerListingsQueryHandler(IProductRepository repo) : IRequestHandler<GetSellerListingsQuery, IReadOnlyList<ProductDto>>
{
    public Task<IReadOnlyList<ProductDto>> Handle(GetSellerListingsQuery request, CancellationToken cancellationToken)
        => repo.GetBySellerDtoAsync(request.SellerId, cancellationToken);
}
