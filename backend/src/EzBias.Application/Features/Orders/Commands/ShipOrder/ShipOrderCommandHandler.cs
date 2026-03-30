using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Commands.ShipOrder;

public class ShipOrderCommandHandler(IOrderRepository repo) : IRequestHandler<ShipOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(ShipOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await repo.GetTrackedByIdAsync(request.OrderId, cancellationToken);
        if (order is null) throw new KeyNotFoundException("Order not found.");

        if (order.SellerId != request.SellerId) throw new UnauthorizedAccessException();

        if (order.Status is not ("paid" or "pending"))
            throw new ArgumentException("Order is not ready to ship.");

        order.Status = "shipping";
        order.Carrier = request.Carrier;
        order.TrackingNumber = request.TrackingNumber;
        order.ShippedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await repo.SaveChangesAsync(cancellationToken);

        return await repo.GetOrderDtoByIdAsync(order.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to load updated order.");
    }
}
