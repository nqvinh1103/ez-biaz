namespace EzBias.Domain.Entities.Payments;

public class Payout
{
    public string Id { get; set; } = default!; // po1

    public string OrderId { get; set; } = default!;
    public string SellerId { get; set; } = default!;

    public decimal Amount { get; set; }

    // pending | paid
    public string Status { get; set; } = "pending";

    public string? BankTransferRef { get; set; }
    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
