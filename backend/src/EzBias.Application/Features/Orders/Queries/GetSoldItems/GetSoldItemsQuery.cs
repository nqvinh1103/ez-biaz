using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Queries.GetSoldItems;

public record GetSoldItemsQuery(string SellerId) : IRequest<IReadOnlyList<SoldItemDto>>;
