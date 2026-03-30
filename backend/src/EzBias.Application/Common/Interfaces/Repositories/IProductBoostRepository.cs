using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IProductBoostRepository
{
    Task<bool> HasActiveBoostAsync(string productId, DateTime nowUtc, CancellationToken cancellationToken = default);
    Task<string> NextIdAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ProductBoost boost, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
