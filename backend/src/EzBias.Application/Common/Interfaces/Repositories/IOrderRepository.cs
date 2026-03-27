using EzBias.Contracts.Features.Orders.Dtos;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IOrderRepository
{
    // READ (query): projection to DTO
    Task<IReadOnlyList<OrderDto>> GetOrdersDtoAsync(string userId, CancellationToken cancellationToken = default);

    // (removed) entity-returning query method; use GetOrdersDtoAsync for reads

    Task<string> NextOrderIdAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Product>> GetProductsForUpdateAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CartItem>> GetCartItemsForCheckoutAsync(string ownerId, CancellationToken cancellationToken = default);

    Task ClearCartAsync(string ownerId, CancellationToken cancellationToken = default);

    Task AddOrderAsync(Order order, CancellationToken cancellationToken = default);

    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
