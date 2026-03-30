namespace EzBias.Domain.Entities;

public class Bid
{
    public string Id { get; set; } = default!; // b1

    public string AuctionId { get; set; } = default!;
    public Auction? Auction { get; set; }

    public string UserId { get; set; } = default!;
    public User? User { get; set; }

    // Snapshot fields for UI (match mock)
    public string Username { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string AvatarBg { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public DateTime PlacedAt { get; set; }
    public bool IsWinning { get; set; }
}
