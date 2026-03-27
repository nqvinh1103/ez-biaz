using EzBias.API.Models;
using EzBias.Application.Features.Products.Dtos;
using EzBias.Application.Common.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController(ICartService cart) : ControllerBase
{

    /// <summary>
    /// Match mock: getCart(userId)
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CartItemDto>>>> GetCart([FromRoute] string userId)
    {
        var enriched = await cart.GetCartAsync(userId);
        return ApiResponse<IReadOnlyList<CartItemDto>>.Ok(enriched);
    }

    public record AddToCartRequest(string ProductId, int Qty = 1);

    /// <summary>
    /// Match mock: addToCart(userId, productId, qty?)
    /// </summary>
    [HttpPost("{userId}/items")]
    public async Task<ActionResult<ApiResponse<object>>> AddToCart([FromRoute] string userId, [FromBody] AddToCartRequest req)
    {
        try
        {
            var result = await cart.AddToCartAsync(userId, req.ProductId, req.Qty);
            return ApiResponse<object>.Ok(new { productId = result.productId, qty = result.qty }, "Item added to cart.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    public record UpdateQtyRequest(int Qty);

    /// <summary>
    /// Match mock: updateCartQty(userId, productId, qty)
    /// </summary>
    [HttpPut("{userId}/items/{productId}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateQty([FromRoute] string userId, [FromRoute] string productId, [FromBody] UpdateQtyRequest req)
    {
        try
        {
            var result = await cart.UpdateQtyAsync(userId, productId, req.Qty);
            return ApiResponse<object>.Ok(new { productId = result.productId, qty = result.qty }, "Cart updated.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Match mock: removeFromCart(userId, productId)
    /// </summary>
    [HttpDelete("{userId}/items/{productId}")]
    public async Task<ActionResult<ApiResponse<object?>>> Remove([FromRoute] string userId, [FromRoute] string productId)
    {
        try
        {
            await cart.RemoveAsync(userId, productId);
            return ApiResponse<object?>.Ok(null, "Item removed from cart.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object?>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Convenience: clear entire cart for a user.
    /// </summary>
    [HttpDelete("{userId}")]
    public async Task<ActionResult<ApiResponse<object?>>> Clear([FromRoute] string userId)
    {
        await cart.ClearAsync(userId);
        return ApiResponse<object?>.Ok(null, "Cart cleared.");
    }
}
