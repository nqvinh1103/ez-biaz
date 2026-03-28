using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities.Payments;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class PayoutRepository(EzBiasDbContext db) : IPayoutRepository
{
    public async Task<string> NextPayoutIdAsync(CancellationToken cancellationToken = default)
    {
        var ids = await db.Payouts.AsNoTracking().Select(x => x.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in ids)
        {
            if (!id.StartsWith("po", StringComparison.OrdinalIgnoreCase)) continue;
            if (int.TryParse(id[2..], out var n) && n > max) max = n;
        }
        return "po" + (max + 1);
    }

    public Task<Payout?> GetByOrderIdAsync(string orderId, CancellationToken cancellationToken = default)
        => db.Payouts.FirstOrDefaultAsync(x => x.OrderId == orderId, cancellationToken);

    public async Task<IReadOnlyList<Payout>> GetPendingAsync(CancellationToken cancellationToken = default)
        => await db.Payouts.AsNoTracking().Where(x => x.Status == "pending").OrderBy(x => x.CreatedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Payout>> GetBySellerIdAsync(string sellerId, CancellationToken cancellationToken = default)
        => await db.Payouts.AsNoTracking().Where(x => x.SellerId == sellerId).OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);

    public Task AddAsync(Payout payout, CancellationToken cancellationToken = default)
        => db.Payouts.AddAsync(payout, cancellationToken).AsTask();

    public async Task MarkPaidAsync(string payoutId, string bankTransferRef, CancellationToken cancellationToken = default)
    {
        var p = await db.Payouts.FirstOrDefaultAsync(x => x.Id == payoutId, cancellationToken);
        if (p is null) throw new KeyNotFoundException("Payout not found.");
        if (p.Status == "paid") return;
        p.Status = "paid";
        p.BankTransferRef = bankTransferRef;
        p.PaidAt = DateTime.UtcNow;
        p.UpdatedAt = DateTime.UtcNow;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
