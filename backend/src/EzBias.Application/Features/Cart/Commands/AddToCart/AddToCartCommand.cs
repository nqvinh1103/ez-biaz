using MediatR;

namespace EzBias.Application.Features.Cart.Commands.AddToCart;

public record AddToCartCommand(string OwnerId, string ProductId, int Qty) : IRequest<(string productId, int qty)>;
