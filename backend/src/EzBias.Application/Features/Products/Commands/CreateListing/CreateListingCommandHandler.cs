using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Features.Products.Models;
using EzBias.Contracts.Features.Products.Dtos;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Products.Commands.CreateListing;

public class CreateListingCommandHandler(IProductRepository repo, IUserRepository users, ISubscriptionRepository subs) : IRequestHandler<CreateListingCommand, ProductDto>
{
    public async Task<ProductDto> Handle(CreateListingCommand request, CancellationToken cancellationToken)
    {
        var req = request.Model;

        if (string.IsNullOrWhiteSpace(req.Name))
            throw new ArgumentException("Product name is required.");
        if (string.IsNullOrWhiteSpace(req.Condition))
            throw new ArgumentException("Please select the item condition.");
        if (req.Price <= 0)
            throw new ArgumentException("Please enter a valid price greater than $0.");
        if (req.Stock <= 0)
            throw new ArgumentException("Please enter a valid stock quantity (>= 1).");
        if (string.IsNullOrWhiteSpace(req.Fandom))
            throw new ArgumentException("Please specify the fandom / group.");
        if (req.ItemTypes is null || req.ItemTypes.Count == 0)
            throw new ArgumentException("Please select at least one item type.");

        var user = await users.GetByIdAsync(request.SellerId, cancellationToken);
        if (user is null)
            throw new ArgumentException("You must be logged in to create a listing.");

        // Listing limits by subscription
        // Free/normal: max 15 active listings. Premium: max 100.
        var active = await subs.GetActiveAsync(request.SellerId, cancellationToken);
        var isPremium = string.Equals(active?.PlanId, "premium", StringComparison.OrdinalIgnoreCase);
        var limit = isPremium ? 100 : 15;

        var activeCount = await repo.CountActiveListingsBySellerAsync(request.SellerId, cancellationToken);
        if (activeCount >= limit)
            throw new ArgumentException($"Listing limit reached ({limit}). Upgrade your plan to post more items.");

        var nextId = await repo.NextIdAsync(cancellationToken);
        var name = req.Name.Trim();
        var fandom = req.Fandom.Trim();

        var imageUrls = req.ImageUrls?.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList() ?? new List<string>();
        var primaryImage = imageUrls.FirstOrDefault()
            ?? ("https://placehold.co/300x300/e8e0f7/7c5cbf?text=" + Uri.EscapeDataString(name.Length > 12 ? name[..12] : name));

        var product = new Product
        {
            Id = nextId,
            Fandom = fandom,
            Artist = fandom,
            Name = name,
            Type = req.ItemTypes[0],
            Condition = req.Condition,
            Price = decimal.Round(req.Price, 2),
            Stock = req.Stock,
            SellerId = request.SellerId,
            Image = primaryImage,
            Description = req.Description ?? string.Empty,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            Images = imageUrls.Select((url, idx) => new ProductImage
            {
                ProductId = nextId,
                Url = url,
                SortOrder = idx
            }).ToList()
        };

        await repo.AddAsync(product, cancellationToken);

        return new ProductDto(
            product.Id,
            product.Fandom,
            product.Artist,
            product.Name,
            product.Type,
            product.Condition,
            product.Price,
            product.Stock,
            product.SellerId,
            product.Image,
            imageUrls,
            product.Description,
            product.CreatedAt.ToString("yyyy-MM-dd"),
            product.IsAuction,
            false,
            null
        );
    }
}
