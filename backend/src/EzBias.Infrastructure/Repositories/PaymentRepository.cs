using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities.Payments;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class PaymentRepository(EzBiasDbContext db) : IPaymentRepository
{
    public async Task<string> NextPaymentIdAsync(CancellationToken cancellationToken = default)
    {
        var ids = await db.Payments.AsNoTracking().Select(x => x.Id).ToListAsync(cancellationToken);
        var max = 0;
        foreach (var id in ids)
        {
            if (!id.StartsWith("pay", StringComparison.OrdinalIgnoreCase)) continue;
            if (int.TryParse(id[3..], out var n) && n > max) max = n;
        }
        return "pay" + (max + 1);
    }

    public Task AddAsync(Payment payment, CancellationToken cancellationToken = default)
        => db.Payments.AddAsync(payment, cancellationToken).AsTask();

    public Task<Payment?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Payments.Include(p => p.Orders).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<Payment?> GetByProviderOrderIdAsync(string providerOrderId, CancellationToken cancellationToken = default)
        => db.Payments.Include(p => p.Orders).FirstOrDefaultAsync(p => p.ProviderOrderId == providerOrderId, cancellationToken);

    public async Task<IReadOnlyList<string>> GetOrderIdsForPaymentAsync(string paymentId, CancellationToken cancellationToken = default)
        => await db.PaymentOrders.AsNoTracking()
            .Where(x => x.PaymentId == paymentId)
            .Select(x => x.OrderId)
            .ToListAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
