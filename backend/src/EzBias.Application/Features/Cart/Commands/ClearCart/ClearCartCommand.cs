using MediatR;

namespace EzBias.Application.Features.Cart.Commands.ClearCart;

public record ClearCartCommand(string OwnerId) : IRequest<Unit>;
