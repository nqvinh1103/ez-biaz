using EzBias.Application.Common.Interfaces.Repositories;
using MediatR;

namespace EzBias.Application.Features.Cart.Commands.UpdateCartQty;

public class UpdateCartQtyCommandHandler(ICartRepository cart, IProductRepository products) : IRequestHandler<UpdateCartQtyCommand, (string productId, int qty)>
{
    public async Task<(string productId, int qty)> Handle(UpdateCartQtyCommand request, CancellationToken cancellationToken)
    {
        if (request.Qty <= 0) throw new ArgumentException("Quantity must be at least 1.");

        await cart.EnsureOwnerExistsAsync(request.OwnerId, cancellationToken);

        var p = await products.GetTrackedByIdAsync(request.ProductId, cancellationToken);
        if (p is null || p.IsAuction) throw new KeyNotFoundException("Product not found.");

        var existing = await cart.GetCartItemAsync(request.OwnerId, request.ProductId, cancellationToken);
        if (existing is null) throw new KeyNotFoundException("Cart item not found.");

        existing.Quantity = Math.Min(request.Qty, p.Stock);
        await cart.SaveChangesAsync(cancellationToken);

        return (existing.ProductId, existing.Quantity);
    }
}
