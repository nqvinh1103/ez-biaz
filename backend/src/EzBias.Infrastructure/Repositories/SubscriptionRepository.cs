using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Subscriptions.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class SubscriptionRepository(EzBiasDbContext db) : ISubscriptionRepository
{
    public Task<UserSubscription?> GetActiveAsync(string userId, CancellationToken cancellationToken = default)
        => db.UserSubscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "active" && s.EndsAt > DateTime.UtcNow, cancellationToken);

    public async Task<SubscriptionDto?> GetActiveDtoAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await db.UserSubscriptions
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.Status == "active" && s.EndsAt > DateTime.UtcNow)
            .OrderByDescending(s => s.StartsAt)
            .Select(s => new SubscriptionDto(
                s.Id,
                s.UserId,
                s.PlanId,
                s.Status,
                s.StartsAt.ToString("o"),
                s.EndsAt.ToString("o")
            ))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<string> NextSubscriptionIdAsync(CancellationToken cancellationToken = default)
    {
        var ids = await db.UserSubscriptions.AsNoTracking().Select(s => s.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in ids)
        {
            if (!id.StartsWith("s", StringComparison.OrdinalIgnoreCase)) continue;
            if (int.TryParse(id[1..], out var n) && n > max) max = n;
        }
        return "s" + (max + 1);
    }

    public Task AddAsync(UserSubscription sub, CancellationToken cancellationToken = default)
        => db.UserSubscriptions.AddAsync(sub, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
