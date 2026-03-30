using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersQueryHandler(IOrderRepository repo) : IRequestHandler<GetOrdersQuery, IReadOnlyList<OrderDto>>
{
    public Task<IReadOnlyList<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        => repo.GetOrdersDtoAsync(request.UserId, cancellationToken);
}
