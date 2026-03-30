namespace EzBias.Domain.Entities;

public class ProductBoost
{
    public string Id { get; set; } = default!; // pb1
    public string ProductId { get; set; } = default!;
    public Product? Product { get; set; }

    public string UserId { get; set; } = default!;
    public User? User { get; set; }

    // pending_payment | active | expired | canceled
    public string Status { get; set; } = "pending_payment";

    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }

    public string? PaymentId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
