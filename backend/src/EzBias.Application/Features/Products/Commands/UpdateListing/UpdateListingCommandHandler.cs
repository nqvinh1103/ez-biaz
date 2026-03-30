using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Commands.UpdateListing;

public class UpdateListingCommandHandler(IProductRepository repo, ISubscriptionRepository subs) : IRequestHandler<UpdateListingCommand, ProductDto?>
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

        if (req.Stock is not null)
        {
            var newStock = req.Stock.Value;
            var wasActive = existing.Stock > 0;
            var willBeActive = newStock > 0;

            // If re-activating a listing, enforce plan limit
            if (!wasActive && willBeActive)
            {
                var active = await subs.GetActiveAsync(request.SellerId, cancellationToken);
                var isPremium = string.Equals(active?.PlanId, "premium", StringComparison.OrdinalIgnoreCase);
                var limit = isPremium ? 100 : 15;

                var activeCount = await repo.CountActiveListingsBySellerAsync(request.SellerId, cancellationToken);
                if (activeCount >= limit)
                    throw new ArgumentException($"Listing limit reached ({limit}). Upgrade your plan to activate more items.");
            }

            existing.Stock = newStock;
        }

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
            existing.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
            existing.Description,
            existing.CreatedAt.ToString("yyyy-MM-dd"),
            existing.IsAuction,
            false,
            null
        );
    }
}
