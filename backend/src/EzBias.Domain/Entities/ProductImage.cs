namespace EzBias.Domain.Entities;

public class ProductImage
{
    public int Id { get; set; }

    public string ProductId { get; set; } = default!;
    public Product? Product { get; set; }

    public string Url { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
