using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Data;

public class EzBiasDbContext : DbContext
{
    public EzBiasDbContext(DbContextOptions<EzBiasDbContext> options) : base(options)
    {
    }

    // TODO: Add DbSet<> for Users, Products, Auctions, Bids, CartItems, Orders, OrderItems, ContactMessages, RefreshTokens
}
