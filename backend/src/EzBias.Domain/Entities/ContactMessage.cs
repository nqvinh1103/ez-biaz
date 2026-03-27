namespace EzBias.Domain.Entities;

public class ContactMessage
{
    public string Id { get; set; } = default!; // c1

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
}
