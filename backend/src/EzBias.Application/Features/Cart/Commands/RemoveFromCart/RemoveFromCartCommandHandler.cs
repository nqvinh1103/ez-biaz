using EzBias.Application.Common.Interfaces.Repositories;
using MediatR;

namespace EzBias.Application.Features.Cart.Commands.RemoveFromCart;

public class RemoveFromCartCommandHandler(ICartRepository cart) : IRequestHandler<RemoveFromCartCommand, Unit>
{
    public async Task<Unit> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        await cart.EnsureOwnerExistsAsync(request.OwnerId, cancellationToken);

        var existing = await cart.GetCartItemAsync(request.OwnerId, request.ProductId, cancellationToken);
        if (existing is null) throw new KeyNotFoundException("Cart item not found.");

        await cart.RemoveCartItemAsync(existing, cancellationToken);
        await cart.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
