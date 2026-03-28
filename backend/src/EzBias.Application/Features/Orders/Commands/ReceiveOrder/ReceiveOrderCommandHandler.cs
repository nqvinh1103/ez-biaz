using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Commands.ReceiveOrder;

public class ReceiveOrderCommandHandler(IOrderRepository repo) : IRequestHandler<ReceiveOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(ReceiveOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await repo.GetTrackedByIdAsync(request.OrderId, cancellationToken);
        if (order is null) throw new KeyNotFoundException("Order not found.");

        if (order.UserId != request.BuyerId) throw new UnauthorizedAccessException();

        if (order.Status != "shipping")
            throw new ArgumentException("Order is not in shipping status.");

        order.Status = "delivered";
        order.DeliveredAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await repo.SaveChangesAsync(cancellationToken);

        return await repo.GetOrderDtoByIdAsync(order.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to load updated order.");
    }
}
