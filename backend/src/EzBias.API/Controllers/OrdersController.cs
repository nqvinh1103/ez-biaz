using EzBias.API.Models;
using EzBias.Application.Features.Orders.Dtos;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Application.Features.Orders.Models;
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
        var dtos = await orders.GetOrdersAsync(userId);
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

            var dto = await orders.CheckoutAsync(model);
            return ApiResponse<OrderDto>.Ok(dto, "Order placed successfully! Thank you for your purchase.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<OrderDto>.Fail(ex.Message));
        }
    }

}
