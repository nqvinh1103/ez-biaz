using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Services;

public interface ICartService
{
    Task<IReadOnlyList<CartItem>> GetCartAsync(string ownerId, CancellationToken cancellationToken = default);

    Task<(string productId, int qty)> AddToCartAsync(string ownerId, string productId, int qty, CancellationToken cancellationToken = default);

    Task<(string productId, int qty)> UpdateQtyAsync(string ownerId, string productId, int qty, CancellationToken cancellationToken = default);

    Task RemoveAsync(string ownerId, string productId, CancellationToken cancellationToken = default);

    Task ClearAsync(string ownerId, CancellationToken cancellationToken = default);
}
