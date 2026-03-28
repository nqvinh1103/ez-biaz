namespace EzBias.Domain.Entities;

public class UserSubscription
{
    public string Id { get; set; } = default!; // s1

    public string UserId { get; set; } = default!;
    public User? User { get; set; }

    // "boost" | "premium"
    public string PlanId { get; set; } = default!;

    // active | canceled | expired
    public string Status { get; set; } = "active";

    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
