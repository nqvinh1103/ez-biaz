using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class AuctionRepository(EzBiasDbContext db) : IAuctionRepository
{
    public async Task<string> NextAuctionIdAsync(CancellationToken cancellationToken = default)
    {
        var list = await db.Auctions.AsNoTracking().Select(a => a.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith("a", StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[1..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return "a" + (max + 1);
    }

    public Task AddAuctionAsync(Auction auction, CancellationToken cancellationToken = default)
    {
        db.Auctions.Add(auction);
        return Task.CompletedTask;
    }

    public Task<bool> AnyLiveAuctionForProductAsync(string productId, CancellationToken cancellationToken = default)
        => db.Auctions.AsNoTracking().AnyAsync(a => a.ProductId == productId && a.IsLive, cancellationToken);

    public async Task<IReadOnlyList<AuctionDto>> GetAuctionsDtoAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default)
    {
        var q = db.Auctions.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(a => a.Fandom.ToLower() == fandom.ToLower());

        if (isLive is not null)
            q = q.Where(a => a.IsLive == isLive.Value);

        if (isUrgent == true)
            q = q.Where(a => a.IsUrgent);

        return await q
            .OrderBy(a => a.EndsAt)
            .Select(a => new AuctionDto(
                a.Id,
                a.ProductId,
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
                a.ContainImage,
                a.Status,
                a.WinnerId,
                a.FinalPrice,
                a.EndedAt
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<AuctionDetailDto?> GetAuctionDetailDtoAsync(string id, CancellationToken cancellationToken = default)
    {
        // Project auction + bids snapshots (no tracking)
        return await db.Auctions.AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new AuctionDetailDto(
                a.Id,
                a.ProductId,
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
                a.ContainImage,
                a.Status,
                a.WinnerId,
                a.FinalPrice,
                a.EndedAt,
                a.Bids
                    .OrderByDescending(b => b.Amount)
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
                    .ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuctionDto>> GetSellerAuctionsDtoAsync(string sellerId, string? status, CancellationToken cancellationToken = default)
    {
        var q = db.Auctions.AsNoTracking().Where(a => a.SellerId == sellerId).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(a => a.Status == status);

        return await q
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AuctionDto(
                a.Id,
                a.ProductId,
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
                a.ContainImage,
                a.Status,
                a.WinnerId,
                a.FinalPrice,
                a.EndedAt
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuctionDto>> GetMyWonAuctionsDtoAsync(string userId, bool pendingPaymentOnly, CancellationToken cancellationToken = default)
    {
        var q = db.Auctions.AsNoTracking().Where(a => a.WinnerId == userId).AsQueryable();

        if (pendingPaymentOnly)
            q = q.Where(a => a.Status == "ended_pending_payment");

        return await q
            .OrderByDescending(a => a.EndsAt)
            .Select(a => new AuctionDto(
                a.Id,
                a.ProductId,
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
                a.ContainImage,
                a.Status,
                a.WinnerId,
                a.FinalPrice,
                a.EndedAt
            ))
            .ToListAsync(cancellationToken);
    }

    // (removed) entity-returning query methods; use *DtoAsync for reads

    public Task<Auction?> GetAuctionForBiddingAsync(string id, CancellationToken cancellationToken = default)
        => db.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<string> NextBidIdAsync(CancellationToken cancellationToken = default)
    {
        var list = await db.Bids.AsNoTracking().Select(b => b.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith("b", StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[1..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return "b" + (max + 1);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
