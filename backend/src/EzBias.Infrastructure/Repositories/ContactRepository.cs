using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class ContactRepository(EzBiasDbContext db) : IContactRepository
{
    public async Task<string> NextIdAsync(CancellationToken cancellationToken = default)
    {
        var list = await db.ContactMessages.AsNoTracking().Select(x => x.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith("c", StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[1..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return "c" + (max + 1);
    }

    public async Task AddAsync(ContactMessage message, CancellationToken cancellationToken = default)
    {
        db.ContactMessages.Add(message);
        await db.SaveChangesAsync(cancellationToken);
    }
}
