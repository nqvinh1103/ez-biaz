using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.RelistAuction;

public class RelistAuctionCommandHandler(
    IAuctionRepository auctions,
    IProductRepository products) : IRequestHandler<RelistAuctionCommand, string>
{
    public async Task<string> Handle(RelistAuctionCommand request, CancellationToken cancellationToken)
    {
        // Duration: allow seconds for testing, otherwise hours.
        var now = DateTime.UtcNow;
        TimeSpan duration;

        if (request.DurationSeconds is not null)
        {
            if (request.DurationSeconds < 30)
                throw new ArgumentException("Auction duration must be at least 30 seconds.");
            duration = TimeSpan.FromSeconds(request.DurationSeconds.Value);
        }
        else
        {
            var hours = request.DurationHours ?? 0;
            if (hours < 1)
                throw new ArgumentException("Auction duration must be at least 1 hour.");
            duration = TimeSpan.FromHours(hours);
        }

        var old = await auctions.GetAuctionForBiddingAsync(request.AuctionId, cancellationToken);
        if (old is null)
            throw new ArgumentException("Auction not found.");

        if (!string.Equals(old.SellerId, request.SellerId, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException();

        if (old.IsLive)
            throw new ArgumentException("Cannot relist a live auction.");

        if (old.Status is not ("ended_no_winner" or "winner_failed" or "canceled"))
            throw new ArgumentException("This auction cannot be relisted.");

        if (string.IsNullOrWhiteSpace(old.ProductId))
            throw new ArgumentException("This auction is not linked to a product.");

        var product = await products.GetTrackedByIdAsync(old.ProductId, cancellationToken);
        if (product is null)
            throw new ArgumentException("Product not found.");

        if (product.Stock <= 0)
            throw new ArgumentException("This product is out of stock.");

        // Reserve 1 unit again
        product.Stock -= 1;
        product.IsAuction = true;
        product.UpdatedAt = now;

        var nextId = await auctions.NextAuctionIdAsync(cancellationToken);
        var a = new Auction
        {
            Id = nextId,
            ProductId = old.ProductId,
            Fandom = old.Fandom,
            Artist = old.Artist,
            Name = old.Name,
            Description = old.Description,
            FloorPrice = old.FloorPrice,
            CurrentBid = old.FloorPrice,
            SellerId = old.SellerId,
            EndsAt = now.Add(duration),
            Image = old.Image,
            IsUrgent = request.IsUrgent,
            IsLive = true,
            ContainImage = old.ContainImage,
            Status = "live",
            CreatedAt = now
        };

        await auctions.AddAuctionAsync(a, cancellationToken);
        await auctions.SaveChangesAsync(cancellationToken);
        await products.SaveChangesAsync(cancellationToken);

        return a.Id;
    }
}
