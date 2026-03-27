namespace EzBias.Infrastructure.Seeding;

public record SeedRoot(
    List<SeedUser> USERS,
    List<SeedProduct> PRODUCTS,
    List<SeedAuction> AUCTIONS,
    Dictionary<string, List<SeedBid>> BID_HISTORY,
    Dictionary<string, List<SeedCartItem>> CARTS,
    List<SeedOrder> ORDERS);

public record SeedUser(
    string id,
    string fullName,
    string username,
    string email,
    string password,
    string phone,
    string address,
    string city,
    string zip,
    string avatar,
    string avatarBg,
    string joinedAt,
    string role);

public record SeedProduct(
    string id,
    string fandom,
    string artist,
    string name,
    string type,
    string condition,
    decimal price,
    int stock,
    string sellerId,
    string image,
    string description,
    string createdAt);

public record SeedAuction(
    string id,
    string fandom,
    string artist,
    string name,
    string description,
    decimal floorPrice,
    decimal currentBid,
    string sellerId,
    string endsAt,
    string image,
    bool isUrgent,
    bool isLive,
    bool containImage);

public record SeedBid(
    string id,
    string auctionId,
    string userId,
    string user,
    string avatar,
    string avatarBg,
    decimal amount,
    string placedAt,
    bool isWinning);

public record SeedCartItem(string productId, int qty);

public record SeedOrder(
    string id,
    string userId,
    List<SeedOrderItem> items,
    decimal shippingFee,
    decimal total,
    string status,
    string payment,
    string address,
    string createdAt);

public record SeedOrderItem(string productId, int qty, decimal price);
