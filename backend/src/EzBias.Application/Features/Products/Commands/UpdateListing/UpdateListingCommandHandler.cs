using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Commands.UpdateListing;

public class UpdateListingCommandHandler(IProductRepository repo) : IRequestHandler<UpdateListingCommand, ProductDto?>
{
    public async Task<ProductDto?> Handle(UpdateListingCommand request, CancellationToken cancellationToken)
    {
        var existing = await repo.GetTrackedByIdAsync(request.ProductId, cancellationToken);
        if (existing is null) return null;
        if (existing.SellerId != request.SellerId) throw new UnauthorizedAccessException();

        var req = request.Model;
        if (req.Name is not null) existing.Name = req.Name;
        if (req.Description is not null) existing.Description = req.Description;
        if (req.Condition is not null) existing.Condition = req.Condition;
        if (req.Price is not null) existing.Price = decimal.Round(req.Price.Value, 2);
        if (req.Stock is not null) existing.Stock = req.Stock.Value;
        existing.UpdatedAt = DateTime.UtcNow;

        await repo.SaveChangesAsync(cancellationToken);

        return new ProductDto(
            existing.Id,
            existing.Fandom,
            existing.Artist,
            existing.Name,
            existing.Type,
            existing.Condition,
            existing.Price,
            existing.Stock,
            existing.SellerId,
            existing.Image,
            existing.Description,
            existing.CreatedAt.ToString("yyyy-MM-dd"),
            existing.IsAuction
        );
    }
}
