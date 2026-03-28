using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Text.Json;

namespace EzBias.Infrastructure.Seeding;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<EzBiasDbContext>();

        // Idempotent: only seed when empty
        if (await db.Users.AnyAsync())
        {
            Console.WriteLine("[Seed] Users table is not empty. Skipping seeding.");
            return;
        }

        Console.WriteLine("[Seed] Seeding database...");

        // seed.json is bundled into publish output by EzBias.API.csproj (seed/seed.json)
        var seedPath = Path.Combine(AppContext.BaseDirectory, "seed", "seed.json");

        if (!File.Exists(seedPath))
        {
            Console.WriteLine($"[Seed] seed.json not found at '{seedPath}'. Skipping seeding.");
            return;
        }

        var json = await File.ReadAllTextAsync(seedPath);
        var seed = JsonSerializer.Deserialize<SeedRoot>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (seed == null)
        {
            Console.WriteLine("[Seed] seed.json deserialized to null. Skipping seeding.");
            return;
        }

        static DateTime ParseUtc(string input)
        {
            var dt = DateTime.Parse(input, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }

        // Users
        var users = seed.USERS.Select(u => new User
        {
            Id = u.id,
            FullName = u.fullName,
            Username = u.username,
            Email = u.email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(u.password),
            Phone = u.phone,
            Address = u.address,
            City = u.city,
            Zip = u.zip,
            Avatar = u.avatar,
            AvatarBg = u.avatarBg,
            JoinedAt = DateOnly.Parse(u.joinedAt),
            Role = u.role,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await db.Users.AddRangeAsync(users);

        // Products
        var products = seed.PRODUCTS.Select(p => new Product
        {
            Id = p.id,
            Fandom = p.fandom,
            Artist = p.artist,
            Name = p.name,
            Type = p.type,
            Condition = p.condition,
            Price = p.price,
            Stock = p.stock,
            SellerId = p.sellerId,
            Image = p.image,
            Description = p.description,
            CreatedAt = DateOnly.Parse(p.createdAt)
        }).ToList();

        await db.Products.AddRangeAsync(products);

        // Auctions
        var auctions = seed.AUCTIONS.Select(a => new Auction
        {
            Id = a.id,
            Fandom = a.fandom,
            Artist = a.artist,
            Name = a.name,
            Description = a.description,
            FloorPrice = a.floorPrice,
            CurrentBid = a.currentBid,
            SellerId = a.sellerId,
            EndsAt = ParseUtc(a.endsAt),
            Image = a.image,
            IsUrgent = a.isUrgent,
            IsLive = a.isLive,
            ContainImage = a.containImage,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await db.Auctions.AddRangeAsync(auctions);

        // Bids (from BID_HISTORY)
        var bids = new List<Bid>();
        foreach (var kv in seed.BID_HISTORY)
        {
            foreach (var b in kv.Value)
            {
                bids.Add(new Bid
                {
                    Id = b.id,
                    AuctionId = b.auctionId,
                    UserId = b.userId,
                    Username = b.user,
                    Avatar = b.avatar,
                    AvatarBg = b.avatarBg,
                    Amount = b.amount,
                    PlacedAt = ParseUtc(b.placedAt),
                    IsWinning = b.isWinning
                });
            }
        }
        await db.Bids.AddRangeAsync(bids);

        // Carts (CARTS is { userId: [{productId,qty}] })
        var cartItems = new List<CartItem>();
        foreach (var kv in seed.CARTS)
        {
            foreach (var item in kv.Value)
            {
                cartItems.Add(new CartItem
                {
                    UserId = kv.Key,
                    ProductId = item.productId,
                    Quantity = item.qty,
                    AddedAt = DateTime.UtcNow
                });
            }
        }
        await db.CartItems.AddRangeAsync(cartItems);

        // Orders + items
        var orders = new List<Order>();
        var orderItems = new List<OrderItem>();

        var productMap = products.ToDictionary(p => p.Id, p => p.Name);

        foreach (var o in seed.ORDERS)
        {
            orders.Add(new Order
            {
                Id = o.id,
                UserId = o.userId,
                ShippingFee = o.shippingFee,
                Total = o.total,
                Status = o.status,
                Payment = o.payment,
                Address = o.address,
                CreatedAt = DateOnly.Parse(o.createdAt)
            });

            foreach (var it in o.items)
            {
                orderItems.Add(new OrderItem
                {
                    OrderId = o.id,
                    ProductId = it.productId,
                    Name = productMap.TryGetValue(it.productId, out var n) ? n : string.Empty,
                    Quantity = it.qty,
                    Price = it.price
                });
            }
        }

        await db.Orders.AddRangeAsync(orders);
        await db.OrderItems.AddRangeAsync(orderItems);

        await db.SaveChangesAsync();
        Console.WriteLine($"[Seed] Done. Inserted users={users.Count}, products={products.Count}, auctions={auctions.Count}, bids={bids.Count}, cartItems={cartItems.Count}, orders={orders.Count}, orderItems={orderItems.Count}.");
    }
}
