namespace EzBias.Domain.Entities.Payments;

public class EscrowTransaction
{
    public string Id { get; set; } = default!; // esc1

    public string OrderId { get; set; } = default!;
    public string SellerId { get; set; } = default!;

    // IN | OUT
    public string Type { get; set; } = default!;

    public decimal Amount { get; set; }

    public string? PaymentId { get; set; }
    public string? PayoutId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
