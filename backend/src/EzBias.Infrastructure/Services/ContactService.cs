using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Domain.Entities;

namespace EzBias.Infrastructure.Services;

public class ContactService(IContactRepository repo) : IContactService
{
    public async Task SendAsync(string name, string email, string message, CancellationToken cancellationToken = default)
    {
        var nextId = await repo.NextIdAsync(cancellationToken);

        var entity = new ContactMessage
        {
            Id = nextId,
            Name = name.Trim(),
            Email = email.Trim(),
            Message = message.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await repo.AddAsync(entity, cancellationToken);
    }
}
