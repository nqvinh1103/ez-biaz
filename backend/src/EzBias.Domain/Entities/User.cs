namespace EzBias.Domain.Entities;

public class User
{
    public string Id { get; set; } = default!; // u1

    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;

    public string Avatar { get; set; } = string.Empty;
    public string AvatarBg { get; set; } = string.Empty;

    // Seller payout bank info (demo/manual settlement)
    public string BankName { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankAccountName { get; set; } = string.Empty;

    public DateOnly JoinedAt { get; set; }
    public string Role { get; set; } = "buyer";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
