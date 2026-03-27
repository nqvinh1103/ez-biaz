using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IOrderRepository
{
    Task<IReadOnlyList<Order>> GetOrdersAsync(string userId, CancellationToken cancellationToken = default);

    Task<string> NextOrderIdAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Product>> GetProductsForUpdateAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CartItem>> GetCartItemsForCheckoutAsync(string ownerId, CancellationToken cancellationToken = default);

    Task ClearCartAsync(string ownerId, CancellationToken cancellationToken = default);

    Task AddOrderAsync(Order order, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
