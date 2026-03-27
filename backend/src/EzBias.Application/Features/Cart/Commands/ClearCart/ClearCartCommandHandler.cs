using EzBias.Application.Common.Interfaces.Repositories;
using MediatR;

namespace EzBias.Application.Features.Cart.Commands.ClearCart;

public class ClearCartCommandHandler(ICartRepository cart) : IRequestHandler<ClearCartCommand, Unit>
{
    public async Task<Unit> Handle(ClearCartCommand request, CancellationToken cancellationToken)
    {
        await cart.EnsureOwnerExistsAsync(request.OwnerId, cancellationToken);

        var items = await cart.GetCartItemsAsync(request.OwnerId, cancellationToken);
        if (items.Count == 0) return Unit.Value;

        await cart.RemoveCartItemsAsync(items, cancellationToken);
        await cart.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
