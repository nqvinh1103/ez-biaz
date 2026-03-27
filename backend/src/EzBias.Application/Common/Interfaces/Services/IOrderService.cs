using EzBias.Application.Features.Orders.Models;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Services;

public interface IOrderService
{
    Task<IReadOnlyList<Order>> GetOrdersAsync(string userId, CancellationToken cancellationToken = default);

    Task<Order> CheckoutAsync(CheckoutModel model, CancellationToken cancellationToken = default);
}
