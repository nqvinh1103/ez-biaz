namespace EzBias.Domain.Entities;

public class Rating
{
    public string Id { get; set; } = default!;

    public string OrderId { get; set; } = default!;
    public Order? Order { get; set; }

    public string BuyerId { get; set; } = default!;
    public User? Buyer { get; set; }

    public string SellerId { get; set; } = default!;
    public User? Seller { get; set; }

    public int ProductRating { get; set; }
    public int SellerRating { get; set; }

    // JSON string array of quick tags
    public string TagsJson { get; set; } = "[]";
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
