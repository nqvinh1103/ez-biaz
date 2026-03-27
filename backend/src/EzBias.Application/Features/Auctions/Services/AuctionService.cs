using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Application.Features.Auctions.Dtos;
using EzBias.Domain.Entities;

namespace EzBias.Application.Features.Auctions.Services;

public class AuctionService(IAuctionRepository repo, IUserRepository users) : IAuctionService
{
    public async Task<IReadOnlyList<AuctionDto>> GetAuctionsAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default)
    {
        var list = await repo.GetAuctionsAsync(fandom, isLive, isUrgent, cancellationToken);
        return list.Select(a => new AuctionDto(
            a.Id,
            a.Fandom,
            a.Artist,
            a.Name,
            a.Description,
            a.FloorPrice,
            a.CurrentBid,
            a.SellerId,
            a.EndsAt,
            a.Image,
            a.IsUrgent,
            a.IsLive,
            a.ContainImage
        )).ToList();
    }

    public async Task<AuctionDetailDto?> GetAuctionDetailAsync(string id, CancellationToken cancellationToken = default)
    {
        var auction = await repo.GetAuctionDetailAsync(id, cancellationToken);
        if (auction is null) return null;

        var bids = auction.Bids
            .OrderByDescending(b => b.PlacedAt)
            .Select(b => new BidDto(
                b.Id,
                b.AuctionId,
                b.UserId,
                b.Username,
                b.Avatar,
                b.AvatarBg,
                b.Amount,
                b.PlacedAt,
                b.IsWinning
            ))
            .ToList();

        return new AuctionDetailDto(
            auction.Id,
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
            bids
        );
    }

    public async Task<BidDto> PlaceBidAsync(string auctionId, string userId, decimal amount, CancellationToken cancellationToken = default)
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
