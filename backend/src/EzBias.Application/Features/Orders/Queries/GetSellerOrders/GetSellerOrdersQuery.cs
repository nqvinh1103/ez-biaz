using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetSellerOrders;

public record GetSellerOrdersQuery(string SellerId, string? Status) : IRequest<IReadOnlyList<OrderDto>>;
