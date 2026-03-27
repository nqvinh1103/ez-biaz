using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Cart.Queries.GetCart;

public class GetCartQueryHandler(ICartRepository cart) : IRequestHandler<GetCartQuery, IReadOnlyList<CartItemDto>>
{
    public async Task<IReadOnlyList<CartItemDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        await cart.EnsureOwnerExistsAsync(request.OwnerId, cancellationToken);
        return await cart.GetCartDtoAsync(request.OwnerId, cancellationToken);
    }
}
