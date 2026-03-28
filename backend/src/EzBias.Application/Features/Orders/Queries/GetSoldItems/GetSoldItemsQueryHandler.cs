using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetSoldItems;

public class GetSoldItemsQueryHandler(IOrderRepository repo) : IRequestHandler<GetSoldItemsQuery, IReadOnlyList<SoldItemDto>>
{
    public Task<IReadOnlyList<SoldItemDto>> Handle(GetSoldItemsQuery request, CancellationToken cancellationToken)
        => repo.GetSoldItemsDtoAsync(request.SellerId, cancellationToken);
}
