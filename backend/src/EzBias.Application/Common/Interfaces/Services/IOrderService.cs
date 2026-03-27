using EzBias.Contracts.Features.Orders.Dtos;
using EzBias.Application.Features.Orders.Models;

namespace EzBias.Application.Common.Interfaces.Services;

public interface IOrderService
{
    Task<IReadOnlyList<OrderDto>> GetOrdersAsync(string userId, CancellationToken cancellationToken = default);

    Task<OrderDto> CheckoutAsync(CheckoutModel model, CancellationToken cancellationToken = default);
}
