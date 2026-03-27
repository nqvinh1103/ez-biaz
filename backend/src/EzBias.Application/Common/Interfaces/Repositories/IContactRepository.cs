using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IContactRepository
{
    Task<string> NextIdAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ContactMessage message, CancellationToken cancellationToken = default);
}
