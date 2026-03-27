using EzBias.Application.Common.Interfaces.Repositories;
using MediatR;

namespace EzBias.Application.Features.Products.Commands.DeleteListing;

public class DeleteListingCommandHandler(IProductRepository repo) : IRequestHandler<DeleteListingCommand, bool>
{
    public async Task<bool> Handle(DeleteListingCommand request, CancellationToken cancellationToken)
    {
        var existing = await repo.GetTrackedByIdAsync(request.ProductId, cancellationToken);
        if (existing is null) return false;
        if (existing.SellerId != request.SellerId) throw new UnauthorizedAccessException();

        await repo.DeleteAsync(existing, cancellationToken);
        return true;
    }
}
