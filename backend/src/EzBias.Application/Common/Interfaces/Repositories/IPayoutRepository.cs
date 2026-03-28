using EzBias.Domain.Entities.Payments;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IPayoutRepository
{
    Task<string> NextPayoutIdAsync(CancellationToken cancellationToken = default);
    Task<Payout?> GetByOrderIdAsync(string orderId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Payout>> GetPendingAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payout>> GetBySellerIdAsync(string sellerId, CancellationToken cancellationToken = default);

    Task AddAsync(Payout payout, CancellationToken cancellationToken = default);
    Task MarkPaidAsync(string payoutId, string bankTransferRef, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
