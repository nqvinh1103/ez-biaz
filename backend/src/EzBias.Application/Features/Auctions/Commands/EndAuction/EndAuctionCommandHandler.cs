using EzBias.Application.Common.Interfaces.Repositories;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.EndAuction;

public class EndAuctionCommandHandler(
    IAuctionRepository auctions,
    IProductRepository products) : IRequestHandler<EndAuctionCommand, bool>
{
    public async Task<bool> Handle(EndAuctionCommand request, CancellationToken cancellationToken)
    {
        var auction = await auctions.GetAuctionForBiddingAsync(request.AuctionId, cancellationToken);
        if (auction is null) return false;

        if (!string.Equals(auction.SellerId, request.SellerId, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException();

        if (!auction.IsLive)
            return true;

        var now = DateTime.UtcNow;
        auction.IsLive = false;
        auction.EndedAt = now;
        auction.UpdatedAt = now;

        var winningBid = auction.Bids
            .OrderByDescending(b => b.Amount)
            .ThenBy(b => b.PlacedAt)
            .FirstOrDefault();

        if (winningBid is null)
        {
            auction.Status = "ended_no_winner";
            auction.WinnerId = null;
            auction.FinalPrice = null;

            // Restore reserved stock and allow fixed-price again
            if (!string.IsNullOrWhiteSpace(auction.ProductId))
            {
                var product = await products.GetTrackedByIdAsync(auction.ProductId, cancellationToken);
                if (product is not null)
                {
                    product.Stock += 1;
                    product.IsAuction = false;
                    product.UpdatedAt = now;
                }

                await products.SaveChangesAsync(cancellationToken);
            }

            await auctions.SaveChangesAsync(cancellationToken);
            return true;
        }

        foreach (var b in auction.Bids)
            b.IsWinning = b.Id == winningBid.Id;

        auction.Status = "ended_pending_payment";
        auction.WinnerId = winningBid.UserId;
        auction.FinalPrice = winningBid.Amount;

        await auctions.SaveChangesAsync(cancellationToken);
        return true;
    }
}
