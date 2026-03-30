using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Commands.ReceiveOrder;

public record ReceiveOrderCommand(string OrderId, string BuyerId) : IRequest<OrderDto>;
