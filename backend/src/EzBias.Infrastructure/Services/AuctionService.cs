using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Domain.Entities;

namespace EzBias.Infrastructure.Services;

public class AuctionService(IAuctionRepository repo, IUserRepository users) : IAuctionService
{
    public Task<IReadOnlyList<Auction>> GetAuctionsAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default)
        => repo.GetAuctionsAsync(fandom, isLive, isUrgent, cancellationToken);

    public Task<Auction?> GetAuctionDetailAsync(string id, CancellationToken cancellationToken = default)
        => repo.GetAuctionDetailAsync(id, cancellationToken);

    public async Task<Bid> PlaceBidAsync(string auctionId, string userId, decimal amount, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User not found. Please log in.");

        var auction = await repo.GetAuctionForBiddingAsync(auctionId, cancellationToken);
        if (auction is null)
            throw new KeyNotFoundException("Auction not found.");

        if (!auction.IsLive)
            throw new ArgumentException("This auction has ended.");

        var minBid = auction.CurrentBid + 5m;
        if (amount < minBid)
            throw new ArgumentException($"Bid must be at least ${minBid:0.00} (current bid + $5.00).");

        if (auction.SellerId == userId)
            throw new ArgumentException("You cannot bid on your own listing.");

        var user = await users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            throw new ArgumentException("User not found. Please log in.");

        foreach (var b in auction.Bids)
            b.IsWinning = false;

        var nextBidId = await repo.NextBidIdAsync(cancellationToken);

        var bid = new Bid
        {
            Id = nextBidId,
            AuctionId = auction.Id,
            UserId = user.Id,
            Username = user.Username,
            Avatar = user.Avatar,
            AvatarBg = user.AvatarBg,
            Amount = amount,
            PlacedAt = DateTime.UtcNow,
            IsWinning = true
        };

        auction.Bids.Add(bid);
        auction.CurrentBid = amount;

        await repo.SaveChangesAsync(cancellationToken);
        return bid;
    }
}
