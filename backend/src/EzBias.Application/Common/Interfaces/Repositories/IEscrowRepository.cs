using EzBias.Domain.Entities.Payments;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IEscrowRepository
{
    Task<string> NextEscrowIdAsync(CancellationToken cancellationToken = default);
    Task AddAsync(EscrowTransaction tx, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
