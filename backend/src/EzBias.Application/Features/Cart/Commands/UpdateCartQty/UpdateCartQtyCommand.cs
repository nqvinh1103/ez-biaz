using MediatR;

namespace EzBias.Application.Features.Cart.Commands.UpdateCartQty;

public record UpdateCartQtyCommand(string OwnerId, string ProductId, int Qty) : IRequest<(string productId, int qty)>;
