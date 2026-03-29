using EzBias.Domain.Entities;
using EzBias.Domain.Entities.Payments;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Data;

public class EzBiasDbContext : DbContext
{
    public EzBiasDbContext(DbContextOptions<EzBiasDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Payments / Escrow
    public DbSet<EzBias.Domain.Entities.Payments.Payment> Payments => Set<EzBias.Domain.Entities.Payments.Payment>();
    public DbSet<EzBias.Domain.Entities.Payments.PaymentOrder> PaymentOrders => Set<EzBias.Domain.Entities.Payments.PaymentOrder>();
    public DbSet<EzBias.Domain.Entities.Payments.EscrowTransaction> EscrowTransactions => Set<EzBias.Domain.Entities.Payments.EscrowTransaction>();
    public DbSet<EzBias.Domain.Entities.Payments.Payout> Payouts => Set<EzBias.Domain.Entities.Payments.Payout>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.Email).IsUnique();
            b.HasIndex(x => x.Username).IsUnique();
            b.Property(x => x.Role).HasMaxLength(32);
        });

        modelBuilder.Entity<UserSubscription>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.UserId);
            b.HasIndex(x => new { x.UserId, x.Status });
            b.Property(x => x.PlanId).HasMaxLength(32);
            b.Property(x => x.Status).HasMaxLength(32);
            b.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.Fandom);
            b.HasIndex(x => x.IsAuction);
            b.HasOne(x => x.Seller)
                .WithMany(u => u.Products)
                .HasForeignKey(x => x.SellerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductImage>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.ProductId);
            b.Property(x => x.Url).HasMaxLength(2048);
            b.HasOne(x => x.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            b.HasOne(x => x.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.UserId);
            b.HasIndex(x => x.SellerId);
            b.HasOne(x => x.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Payment>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.UserId);
            b.HasIndex(x => x.Status);
            b.Property(x => x.Provider).HasMaxLength(32);
            b.Property(x => x.Type).HasMaxLength(32);
            b.Property(x => x.Status).HasMaxLength(32);
            b.Property(x => x.Reference).HasMaxLength(64);
            b.Property(x => x.Payload).HasMaxLength(16_384);
            b.Property(x => x.ProviderOrderId).HasMaxLength(128);
            b.Property(x => x.RequestId).HasMaxLength(64);

            b.HasMany(x => x.Orders)
                .WithOne(x => x.Payment)
                .HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PaymentOrder>(b =>
        {
            b.HasKey(x => new { x.PaymentId, x.OrderId });
            b.HasIndex(x => x.OrderId);
        });

        modelBuilder.Entity<EscrowTransaction>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.OrderId);
            b.HasIndex(x => x.SellerId);
            b.Property(x => x.Type).HasMaxLength(8);
        });

        modelBuilder.Entity<Payout>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.OrderId).IsUnique();
            b.HasIndex(x => x.SellerId);
            b.Property(x => x.Status).HasMaxLength(16);
            b.Property(x => x.BankTransferRef).HasMaxLength(128);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.OrderId);
            b.HasOne(x => x.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Auction>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.Fandom);
            b.HasIndex(x => x.ProductId);
            b.HasOne(x => x.Seller)
                .WithMany(u => u.Auctions)
                .HasForeignKey(x => x.SellerId)
                .OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Bid>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
            b.HasIndex(x => x.AuctionId);
            b.HasOne(x => x.Auction)
                .WithMany(a => a.Bids)
                .HasForeignKey(x => x.AuctionId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.User)
                .WithMany(u => u.Bids)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ContactMessage>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<RefreshToken>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.UserId);
            b.HasOne(x => x.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
