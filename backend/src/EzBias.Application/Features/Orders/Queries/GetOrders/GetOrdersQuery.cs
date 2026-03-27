using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetOrders;

public record GetOrdersQuery(string UserId) : IRequest<IReadOnlyList<OrderDto>>;
