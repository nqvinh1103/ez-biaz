using EzBias.Domain.Entities.Payments;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IPaymentRepository
{
    Task<string> NextPaymentIdAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Payment payment, CancellationToken cancellationToken = default);

    Task<Payment?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Payment?> GetByProviderOrderIdAsync(string providerOrderId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetOrderIdsForPaymentAsync(string paymentId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
