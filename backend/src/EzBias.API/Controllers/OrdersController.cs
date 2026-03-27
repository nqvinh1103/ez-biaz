using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Application.Orders.Models;
using EzBias.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orders) : ControllerBase
{
    /// <summary>
    /// Match mock: getOrders(userId)
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OrderDto>>>> GetOrders([FromRoute] string userId)
    {
        var list = await orders.GetOrdersAsync(userId);
        var dtos = list.Select(o => new OrderDto(
            o.Id,
            o.UserId,
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.Quantity, i.Price)).ToList(),
            o.ShippingFee,
            o.Total,
            o.Status,
            o.Payment,
            o.Address,
            o.CreatedAt.ToString("yyyy-MM-dd")
        )).ToList();

        return ApiResponse<IReadOnlyList<OrderDto>>.Ok(dtos);
    }

    /// <summary>
    /// Match mock: checkout(userId, shippingInfo, paymentMethod, reactCartItems?)
    /// 
    /// Request body:
    /// {
    ///   userId: string,
    ///   shippingInfo: { fullName,email,address,city,zip,phone },
    ///   paymentMethod: string,
    ///   items?: [{ productId, name, price, qty }]
    /// }
    /// If items omitted, uses server-side cart for the user.
    /// </summary>
    [HttpPost("checkout")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Checkout([FromBody] CheckoutRequest req)
    {
        try
        {
            var model = new CheckoutModel(
                req.UserId,
                new ShippingInfoModel(
                    req.ShippingInfo.FullName,
                    req.ShippingInfo.Email,
                    req.ShippingInfo.Address,
                    req.ShippingInfo.City,
                    req.ShippingInfo.Zip,
                    req.ShippingInfo.Phone
                ),
                req.PaymentMethod,
                req.Items?.Select(i => new CheckoutItemModel(i.ProductId, i.Name, i.Price, i.Qty)).ToList()
            );

            var order = await orders.CheckoutAsync(model);

            var dto = new OrderDto(
                order.Id,
                order.UserId,
                order.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.Quantity, i.Price)).ToList(),
                order.ShippingFee,
                order.Total,
                order.Status,
                order.Payment,
                order.Address,
                order.CreatedAt.ToString("yyyy-MM-dd")
            );

            return ApiResponse<OrderDto>.Ok(dto, "Order placed successfully! Thank you for your purchase.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<OrderDto>.Fail(ex.Message));
        }
    }

}
