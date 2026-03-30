using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Cart.Queries.GetCart;

public record GetCartQuery(string OwnerId) : IRequest<IReadOnlyList<CartItemDto>>;
