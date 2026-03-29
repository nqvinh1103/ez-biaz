namespace EzBias.Domain.Entities;

public class SubscriptionPlan
{
    // "free" | "boost" | "premium" (string ids to stay mock-compatible)
    public string Id { get; set; } = default!;

    public string Name { get; set; } = string.Empty;

    // Display/charge amount (VND) for demo
    public decimal Price { get; set; }

    // Duration in hours (boost=24) or days (premium=30). Keep simple.
    public int DurationDays { get; set; }
    public int DurationHours { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
