using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class ProductBoostRepository(EzBiasDbContext db) : IProductBoostRepository
{
    public Task<bool> HasActiveBoostAsync(string productId, DateTime nowUtc, CancellationToken cancellationToken = default)
        => db.ProductBoosts.AsNoTracking().AnyAsync(x => x.ProductId == productId && x.Status == "active" && x.EndsAt > nowUtc, cancellationToken);

    public async Task<string> NextIdAsync(CancellationToken cancellationToken = default)
    {
        var list = await db.ProductBoosts.AsNoTracking().Select(x => x.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith("pb", StringComparison.OrdinalIgnoreCase)) continue;
            if (int.TryParse(id[2..], out var n) && n > max) max = n;
        }
        return "pb" + (max + 1);
    }

    public Task AddAsync(ProductBoost boost, CancellationToken cancellationToken = default)
        => db.ProductBoosts.AddAsync(boost, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
