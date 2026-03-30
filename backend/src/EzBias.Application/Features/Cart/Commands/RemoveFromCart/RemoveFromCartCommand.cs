using MediatR;

namespace EzBias.Application.Features.Cart.Commands.RemoveFromCart;

public record RemoveFromCartCommand(string OwnerId, string ProductId) : IRequest<Unit>;
