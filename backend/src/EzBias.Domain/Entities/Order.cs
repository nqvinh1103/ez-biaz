namespace EzBias.Domain.Entities;

public class Order
{
    public string Id { get; set; } = default!; // o1

    public string UserId { get; set; } = default!;
    public User? User { get; set; }

    public decimal ShippingFee { get; set; }
    public decimal Total { get; set; }

    public string Status { get; set; } = "pending";
    public string Payment { get; set; } = string.Empty; // bank, paypal, etc (match mock)

    public string Address { get; set; } = string.Empty;

    public DateOnly CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
