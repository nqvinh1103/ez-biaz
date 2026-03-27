using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Cart.Commands.AddToCart;

public class AddToCartCommandHandler(ICartRepository cart, IProductRepository products) : IRequestHandler<AddToCartCommand, (string productId, int qty)>
{
    public async Task<(string productId, int qty)> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        if (request.Qty <= 0) throw new ArgumentException("Quantity must be at least 1.");

        await cart.EnsureOwnerExistsAsync(request.OwnerId, cancellationToken);

        var p = await products.GetByIdAsync(request.ProductId, cancellationToken);
        if (p is null) throw new KeyNotFoundException("Product not found.");

        var existing = await cart.GetCartItemAsync(request.OwnerId, request.ProductId, cancellationToken);
        if (existing is null)
        {
            var item = new CartItem
            {
                UserId = request.OwnerId,
                ProductId = request.ProductId,
                Quantity = Math.Min(request.Qty, p.Stock)
            };

            await cart.AddCartItemAsync(item, cancellationToken);
            await cart.SaveChangesAsync(cancellationToken);
            return (item.ProductId, item.Quantity);
        }

        existing.Quantity = Math.Min(existing.Quantity + request.Qty, p.Stock);
        await cart.SaveChangesAsync(cancellationToken);

        return (existing.ProductId, existing.Quantity);
    }
}
