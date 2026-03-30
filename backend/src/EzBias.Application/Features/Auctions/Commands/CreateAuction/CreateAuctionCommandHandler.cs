using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.CreateAuction;

public class CreateAuctionCommandHandler(
    IAuctionRepository auctions,
    IProductRepository products
) : IRequestHandler<CreateAuctionCommand, AuctionDetailDto>
{
    public async Task<AuctionDetailDto> Handle(CreateAuctionCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ProductId))
            throw new ArgumentException("productId is required.");
        if (string.IsNullOrWhiteSpace(request.SellerId))
            throw new ArgumentException("sellerId is required.");

        // Duration: allow seconds for testing, otherwise hours for normal use.
        var now = DateTime.UtcNow;
        TimeSpan duration;

        if (request.DurationSeconds is not null)
        {
            if (request.DurationSeconds < 30)
                throw new ArgumentException("Auction duration must be at least 30 seconds.");

            const int maxSeconds = 14 * 24 * 60 * 60;
            if (request.DurationSeconds > maxSeconds)
                throw new ArgumentException($"Auction duration must be <= {maxSeconds} seconds.");

            duration = TimeSpan.FromSeconds(request.DurationSeconds.Value);
        }
        else
        {
            var hours = request.DurationHours ?? 0;
            if (hours < 1)
                throw new ArgumentException("Auction duration must be at least 1 hour.");

            // A reasonable upper bound to avoid abuse (can be adjusted later)
            const int maxHours = 24 * 14;
            if (hours > maxHours)
                throw new ArgumentException($"Auction duration must be <= {maxHours} hours.");

            duration = TimeSpan.FromHours(hours);
        }

        // Load product tracked, because we will mark it as auction
        var product = await products.GetTrackedByIdAsync(request.ProductId, cancellationToken);
        if (product is null)
            throw new ArgumentException("Product not found.");

        if (product.SellerId != request.SellerId)
            throw new UnauthorizedAccessException();

        if (product.Stock <= 0)
            throw new ArgumentException("This product is out of stock.");

        if (product.IsAuction)
            throw new ArgumentException("This product is already in auction mode.");

        var hasLive = await auctions.AnyLiveAuctionForProductAsync(product.Id, cancellationToken);
        if (hasLive)
            throw new ArgumentException("This product already has a live auction.");

        var floor = product.Price;
        var nextId = await auctions.NextAuctionIdAsync(cancellationToken);

        var auction = new Auction
        {
            Id = nextId,
            ProductId = product.Id,
            Fandom = product.Fandom,
            Artist = product.Artist,
            Name = product.Name,
            Description = product.Description,
            FloorPrice = floor,
            CurrentBid = floor,
            SellerId = request.SellerId,
            EndsAt = now.Add(duration),
            Image = product.Image,
            IsUrgent = request.IsUrgent,
            IsLive = true,
            ContainImage = !string.IsNullOrWhiteSpace(product.Image),
            CreatedAt = DateTime.UtcNow
        };

        // Mark product as auction to prevent cart/checkout.
        product.IsAuction = true;

        await auctions.AddAuctionAsync(auction, cancellationToken);
        await auctions.SaveChangesAsync(cancellationToken);

        return new AuctionDetailDto(
            auction.Id,
            auction.ProductId,
            auction.Fandom,
            auction.Artist,
            auction.Name,
            auction.Description,
            auction.FloorPrice,
            auction.CurrentBid,
            auction.SellerId,
            auction.EndsAt,
            auction.Image,
            auction.IsUrgent,
            auction.IsLive,
            auction.ContainImage,
            Array.Empty<BidDto>()
        );
    }
}
