using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Commands.ShipOrder;

public record ShipOrderCommand(string OrderId, string SellerId, string? Carrier, string? TrackingNumber) : IRequest<OrderDto>;
