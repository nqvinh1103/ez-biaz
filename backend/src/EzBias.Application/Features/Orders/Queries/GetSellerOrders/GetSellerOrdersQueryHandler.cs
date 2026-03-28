using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetSellerOrders;

public class GetSellerOrdersQueryHandler(IOrderRepository repo) : IRequestHandler<GetSellerOrdersQuery, IReadOnlyList<OrderDto>>
{
    public Task<IReadOnlyList<OrderDto>> Handle(GetSellerOrdersQuery request, CancellationToken cancellationToken)
        => repo.GetSellerOrdersDtoAsync(request.SellerId, request.Status, cancellationToken);
}
