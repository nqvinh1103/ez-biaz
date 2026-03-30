using EzBias.Contracts.Features.Subscriptions.Dtos;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface ISubscriptionRepository
{
    Task<UserSubscription?> GetActiveAsync(string userId, CancellationToken cancellationToken = default);
    Task<SubscriptionDto?> GetActiveDtoAsync(string userId, CancellationToken cancellationToken = default);

    Task<string> NextSubscriptionIdAsync(CancellationToken cancellationToken = default);

    Task AddAsync(UserSubscription sub, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
