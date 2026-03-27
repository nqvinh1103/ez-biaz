using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class AuctionRepository(EzBiasDbContext db) : IAuctionRepository
{
    public async Task<IReadOnlyList<Auction>> GetAuctionsAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default)
    {
        var q = db.Auctions.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(a => a.Fandom.ToLower() == fandom.ToLower());

        if (isLive is not null)
            q = q.Where(a => a.IsLive == isLive.Value);

        if (isUrgent == true)
            q = q.Where(a => a.IsUrgent);

        return await q.OrderBy(a => a.EndsAt).ToListAsync(cancellationToken);
    }

    public Task<Auction?> GetAuctionDetailAsync(string id, CancellationToken cancellationToken = default)
        => db.Auctions.AsNoTracking()
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

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
