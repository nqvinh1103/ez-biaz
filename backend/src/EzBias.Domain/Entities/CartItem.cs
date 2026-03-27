namespace EzBias.Domain.Entities;

public class CartItem
{
    public int Id { get; set; }

    public string UserId { get; set; } = default!;
    public User? User { get; set; }

    public string ProductId { get; set; } = default!;
    public Product? Product { get; set; }

    public int Quantity { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
