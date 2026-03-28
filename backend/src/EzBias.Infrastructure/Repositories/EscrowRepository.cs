using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities.Payments;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class EscrowRepository(EzBiasDbContext db) : IEscrowRepository
{
    public async Task<string> NextEscrowIdAsync(CancellationToken cancellationToken = default)
    {
        var ids = await db.EscrowTransactions.AsNoTracking().Select(x => x.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in ids)
        {
            if (!id.StartsWith("esc", StringComparison.OrdinalIgnoreCase)) continue;
            if (int.TryParse(id[3..], out var n) && n > max) max = n;
        }
        return "esc" + (max + 1);
    }

    public Task AddAsync(EscrowTransaction tx, CancellationToken cancellationToken = default)
        => db.EscrowTransactions.AddAsync(tx, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
