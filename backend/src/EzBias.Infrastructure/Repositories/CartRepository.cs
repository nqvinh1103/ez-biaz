using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class CartRepository(EzBiasDbContext db) : ICartRepository
{
    public async Task EnsureOwnerExistsAsync(string ownerId, CancellationToken cancellationToken = default)
    {
        var exists = await db.Users.AsNoTracking().AnyAsync(u => u.Id == ownerId, cancellationToken);
        if (exists) return;

        db.Users.Add(new User
        {
            Id = ownerId,
            FullName = "Guest",
            Username = ownerId,
            Email = $"{ownerId}@guest.local",
            Role = "guest",
            PasswordHash = string.Empty,
            Phone = string.Empty,
            Address = string.Empty,
            City = string.Empty,
            Zip = string.Empty,
            Avatar = "G",
            AvatarBg = "#ad93e6",
            JoinedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CartItem>> GetCartItemsAsync(string ownerId, CancellationToken cancellationToken = default)
        => await db.CartItems
            .AsNoTracking()
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == ownerId)
            .OrderByDescending(ci => ci.AddedAt)
            .ToListAsync(cancellationToken);

    public Task<CartItem?> GetCartItemAsync(string ownerId, string productId, CancellationToken cancellationToken = default)
        => db.CartItems.FirstOrDefaultAsync(c => c.UserId == ownerId && c.ProductId == productId, cancellationToken);

    public async Task AddCartItemAsync(CartItem item, CancellationToken cancellationToken = default)
    {
        db.CartItems.Add(item);
        await db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);

    public async Task RemoveCartItemAsync(CartItem item, CancellationToken cancellationToken = default)
    {
        db.CartItems.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveCartItemsAsync(IEnumerable<CartItem> items, CancellationToken cancellationToken = default)
    {
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync(cancellationToken);
    }
}
