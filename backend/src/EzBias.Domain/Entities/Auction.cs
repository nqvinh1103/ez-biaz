namespace EzBias.Domain.Entities;

public class Auction
{
    public string? ProductId { get; set; }
    public Product? Product { get; set; }

    public string Id { get; set; } = default!; // a1

    public string Fandom { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal FloorPrice { get; set; }
    public decimal CurrentBid { get; set; }

    public string SellerId { get; set; } = default!;
    public User? Seller { get; set; }

    public DateTime EndsAt { get; set; }

    public string Image { get; set; } = string.Empty;
    public bool IsUrgent { get; set; }
    public bool IsLive { get; set; }
    public bool ContainImage { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}
