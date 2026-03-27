using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersQueryHandler(IOrderRepository repo) : IRequestHandler<GetOrdersQuery, IReadOnlyList<OrderDto>>
{
    public async Task<IReadOnlyList<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var list = await repo.GetOrdersAsync(request.UserId, cancellationToken);
        return list.Select(o => new OrderDto(
            o.Id,
            o.UserId,
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.Quantity, i.Price)).ToList(),
            o.ShippingFee,
            o.Total,
            o.Status,
            o.Payment,
            o.Address,
            o.CreatedAt.ToString("yyyy-MM-dd")
        )).ToList();
    }
}
