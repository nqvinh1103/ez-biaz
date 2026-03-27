using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.PlaceBid;

public class PlaceBidCommandHandler(
    IAuctionRepository auctions,
    IUserRepository users
) : IRequestHandler<PlaceBidCommand, BidDto>
{
    public async Task<BidDto> Handle(PlaceBidCommand request, CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("Bid amount must be greater than 0.");

        var user = await users.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            throw new ArgumentException("You must be logged in to place a bid.");

        // tracked, because we will mutate
        var auction = await auctions.GetAuctionForBiddingAsync(request.AuctionId, cancellationToken);
        if (auction is null)
            throw new ArgumentException("Auction not found.");

        if (!auction.IsLive)
            throw new ArgumentException("This auction is no longer live.");

        // guard: seller cannot bid on their own item
        if (auction.SellerId == request.UserId)
            throw new ArgumentException("You cannot bid on your own auction.");

        var minNext = auction.CurrentBid + 5;
        if (request.Amount < minNext)
            throw new ArgumentException($"Bid must be at least ${minNext}.");

        // mark previous winning bids false
        foreach (var b in auction.Bids.Where(b => b.IsWinning))
            b.IsWinning = false;

        var nextBidId = await auctions.NextBidIdAsync(cancellationToken);
        var bid = new Bid
        {
            Id = nextBidId,
            AuctionId = auction.Id,
            UserId = request.UserId,
            Username = user.Username,
            Avatar = user.Avatar,
            AvatarBg = user.AvatarBg,
            Amount = request.Amount,
            PlacedAt = DateTime.UtcNow,
            IsWinning = true
        };

        auction.Bids.Add(bid);
        auction.CurrentBid = request.Amount;

        await auctions.SaveChangesAsync(cancellationToken);

        return new BidDto(
            bid.Id,
            bid.AuctionId,
            bid.UserId,
            bid.Username,
            bid.Avatar,
            bid.AvatarBg,
            bid.Amount,
            bid.PlacedAt,
            bid.IsWinning
        );
    }
}
