using EzBias.Application.Common.Interfaces.Realtime;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.PlaceBid;

public class PlaceBidCommandHandler(
    IAuctionRepository auctions,
    IUserRepository users,
    IAuctionRealtimePublisher realtime
) : IRequestHandler<PlaceBidCommand, BidDto>
{
    private static readonly TimeSpan BidCooldown = TimeSpan.FromSeconds(2);
    private static readonly TimeSpan BidRateWindow = TimeSpan.FromMinutes(1);
    private const int MaxBidsPerWindow = 12;

    private static readonly TimeSpan AntiSnipingWindow = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan AntiSnipingExtend = TimeSpan.FromSeconds(30);
    private const decimal MinBidIncrement = 50000m;

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

        var now = DateTime.UtcNow;

        var userBids = auction.Bids
            .Where(b => b.UserId == request.UserId)
            .OrderByDescending(b => b.PlacedAt)
            .ToList();

        var lastUserBid = userBids.FirstOrDefault();
        if (lastUserBid is not null && now - lastUserBid.PlacedAt < BidCooldown)
        {
            var waitSeconds = Math.Max(1, (int)Math.Ceiling((BidCooldown - (now - lastUserBid.PlacedAt)).TotalSeconds));
            throw new ArgumentException($"You're bidding too fast. Please wait {waitSeconds}s and try again.");
        }

        var bidsInWindow = userBids.Count(b => now - b.PlacedAt <= BidRateWindow);
        if (bidsInWindow >= MaxBidsPerWindow)
            throw new ArgumentException("Bid rate limit reached: max 12 bids per minute for this auction.");

        var minNext = auction.CurrentBid + MinBidIncrement;
        if (request.Amount < minNext)
            throw new ArgumentException($"Bid must be at least {minNext:0} VND.");

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
            PlacedAt = now,
            IsWinning = true
        };

        auction.Bids.Add(bid);
        auction.CurrentBid = request.Amount;
        auction.UpdatedAt = now;

        // Anti-sniping: if bid arrives near the end, extend auction.
        var wasExtended = false;
        var remaining = auction.EndsAt - now;
        if (remaining <= AntiSnipingWindow)
        {
            auction.EndsAt = auction.EndsAt.Add(AntiSnipingExtend);
            wasExtended = true;
        }

        await auctions.SaveChangesAsync(cancellationToken);

        var dto = new BidDto(
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

        try
        {
            await realtime.PublishBidPlacedAsync(auction.Id, auction.CurrentBid, auction.EndsAt, dto, cancellationToken);
            if (wasExtended)
                await realtime.PublishAuctionExtendedAsync(auction.Id, auction.EndsAt, cancellationToken);
        }
        catch
        {
            // Realtime failure must not break bid placement.
        }

        return dto;
    }
}
