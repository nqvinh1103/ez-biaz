using EzBias.API.Models;
using EzBias.Application.Features.Orders.Commands.Checkout;
using EzBias.Application.Features.Orders.Models;
using EzBias.Application.Features.Orders.Commands.ReceiveOrder;
using EzBias.Application.Features.Orders.Commands.ShipOrder;
using EzBias.Application.Features.Orders.Queries.GetOrders;
using EzBias.Application.Features.Orders.Queries.GetSellerOrders;
using EzBias.Application.Features.Orders.Queries.GetSoldItems;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Seller: list orders that belong to this seller.
    /// </summary>
    [HttpGet("seller/{sellerId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OrderDto>>>> GetSellerOrders([FromRoute] string sellerId, [FromQuery] string? status)
    {
        var list = await mediator.Send(new GetSellerOrdersQuery(sellerId, status));
        return ApiResponse<IReadOnlyList<OrderDto>>.Ok(list);
    }

    /// <summary>
    /// Seller: request shipping / confirm shipped.
    /// </summary>
    [HttpPost("{orderId}/ship")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Ship([FromRoute] string orderId, [FromBody] ShipOrderRequest req)
    {
        try
        {
            var dto = await mediator.Send(new ShipOrderCommand(orderId, req.SellerId, req.Carrier, req.TrackingNumber));
            return ApiResponse<OrderDto>.Ok(dto, "Order is now shipping.");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<OrderDto>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<OrderDto>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Buyer: confirm received.
    /// </summary>
    [HttpPost("{orderId}/received")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Received([FromRoute] string orderId, [FromBody] ReceiveOrderRequest req)
    {
        try
        {
            var dto = await mediator.Send(new ReceiveOrderCommand(orderId, req.BuyerId));
            return ApiResponse<OrderDto>.Ok(dto, "Order delivered.");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<OrderDto>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<OrderDto>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Seller: list items sold by this seller.
    /// </summary>
    [HttpGet("seller/{sellerId}/sold")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SoldItemDto>>>> GetSoldItems([FromRoute] string sellerId)
    {
        var list = await mediator.Send(new GetSoldItemsQuery(sellerId));
        return ApiResponse<IReadOnlyList<SoldItemDto>>.Ok(list);
    }

    /// <summary>
    /// Match mock: getOrders(userId)
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<OrderDto>>>> GetOrders([FromRoute] string userId)
    {
        var dtos = await mediator.Send(new GetOrdersQuery(userId));
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
    public async Task<ActionResult<ApiResponse<CheckoutResultDto>>> Checkout([FromBody] CheckoutRequest req)
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

            var dto = await mediator.Send(new CheckoutCommand(model));
            return ApiResponse<CheckoutResultDto>.Ok(dto, "Order placed successfully! Thank you for your purchase.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<CheckoutResultDto>.Fail(ex.Message));
        }
    }

}
