namespace EzBias.Domain.Entities;

public class Product
{
    public string Id { get; set; } = default!; // p1

    public string Fandom { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public int Stock { get; set; }

    public string SellerId { get; set; } = default!;
    public User? Seller { get; set; }

    public string Image { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public DateOnly CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
