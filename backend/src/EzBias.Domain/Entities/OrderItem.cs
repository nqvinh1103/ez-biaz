namespace EzBias.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }

    public string OrderId { get; set; } = default!;
    public Order? Order { get; set; }

    public string ProductId { get; set; } = default!;

    public string Name { get; set; } = string.Empty; // snapshot
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
