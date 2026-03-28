using EzBias.Contracts.Features.Orders.Dtos;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IOrderRepository
{
    // READ (query): projection to DTO
    Task<IReadOnlyList<OrderDto>> GetOrdersDtoAsync(string userId, CancellationToken cancellationToken = default);

    // READ (seller): orders for seller
    Task<IReadOnlyList<OrderDto>> GetSellerOrdersDtoAsync(string sellerId, string? status, CancellationToken cancellationToken = default);

    // READ (single)
    Task<OrderDto?> GetOrderDtoByIdAsync(string orderId, CancellationToken cancellationToken = default);

    // READ (seller): items sold by seller
    Task<IReadOnlyList<SoldItemDto>> GetSoldItemsDtoAsync(string sellerId, CancellationToken cancellationToken = default);

    // WRITE
    Task<Order?> GetTrackedByIdAsync(string orderId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> NextOrderIdsAsync(int count, CancellationToken cancellationToken = default);

    // (removed) entity-returning query method; use GetOrdersDtoAsync for reads

    Task<string> NextOrderIdAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Product>> GetProductsForUpdateAsync(IEnumerable<string> productIds, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CartItem>> GetCartItemsForCheckoutAsync(string ownerId, CancellationToken cancellationToken = default);

    Task ClearCartAsync(string ownerId, CancellationToken cancellationToken = default);

    Task AddOrderAsync(Order order, CancellationToken cancellationToken = default);

    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
