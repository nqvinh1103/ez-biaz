using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

using EzBias.Contracts.Features.Products.Dtos;

public interface ICartRepository
{
    Task EnsureOwnerExistsAsync(string ownerId, CancellationToken cancellationToken = default);

    // READ (query): projection to DTO to avoid N+1
    Task<IReadOnlyList<CartItemDto>> GetCartDtoAsync(string ownerId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CartItem>> GetCartItemsAsync(string ownerId, CancellationToken cancellationToken = default);

    Task<CartItem?> GetCartItemAsync(string ownerId, string productId, CancellationToken cancellationToken = default);

    Task AddCartItemAsync(CartItem item, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);

    Task RemoveCartItemAsync(CartItem item, CancellationToken cancellationToken = default);

    Task RemoveCartItemsAsync(IEnumerable<CartItem> items, CancellationToken cancellationToken = default);
}
