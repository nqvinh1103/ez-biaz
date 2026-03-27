using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Cart.Queries.GetCart;

public class GetCartQueryHandler(ICartRepository cart, IProductRepository products) : IRequestHandler<GetCartQuery, IReadOnlyList<CartItemDto>>
{
    public async Task<IReadOnlyList<CartItemDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        await cart.EnsureOwnerExistsAsync(request.OwnerId, cancellationToken);

        var items = await cart.GetCartItemsAsync(request.OwnerId, cancellationToken);
        var result = new List<CartItemDto>(items.Count);

        foreach (var i in items)
        {
            var p = await products.GetByIdAsync(i.ProductId, cancellationToken);
            if (p is null) continue; // product removed => skip

            result.Add(new CartItemDto(
                i.ProductId,
                i.Quantity,
                p.Name,
                p.Artist,
                p.Fandom,
                p.Price,
                p.Image,
                p.Stock
            ));
        }

        return result;
    }
}
