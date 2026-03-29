namespace EzBias.Domain.Entities.Payments;

public class Payment
{
    public string Id { get; set; } = default!; // pay1

    // momo
    public string Provider { get; set; } = "momo";

    // order | subscription
    public string Type { get; set; } = default!;

    public string UserId { get; set; } = default!;

    public decimal Amount { get; set; }

    // pending | paid | failed
    public string Status { get; set; } = "pending";

    // For subscription: planId (boost|premium). For orders: empty.
    public string Reference { get; set; } = string.Empty;

    // For order payments: store checkout/shipping payload (JSON)
    public string Payload { get; set; } = string.Empty;

    // MoMo fields
    public string? ProviderOrderId { get; set; }
    public string? RequestId { get; set; }
    public long? TransId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PaymentOrder> Orders { get; set; } = new List<PaymentOrder>();
}
