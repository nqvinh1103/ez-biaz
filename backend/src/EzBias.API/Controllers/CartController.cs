using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController(EzBiasDbContext db) : ControllerBase
{
    /// <summary>
    /// Match mock: getCart(userId)
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CartItemDto>>>> GetCart([FromRoute] string userId)
    {
        var items = await db.CartItems.AsNoTracking()
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == userId)
            .OrderByDescending(ci => ci.AddedAt)
            .ToListAsync();

        var enriched = items
            .Where(i => i.Product is not null)
            .Select(i => new CartItemDto(
                i.ProductId,
                i.Quantity,
                i.Product!.Name,
                i.Product.Artist,
                i.Product.Fandom,
                i.Product.Price,
                i.Product.Image,
                i.Product.Stock
            ))
            .ToList();

        return ApiResponse<IReadOnlyList<CartItemDto>>.Ok(enriched);
    }

    public record AddToCartRequest(string ProductId, int Qty = 1);

    /// <summary>
    /// Match mock: addToCart(userId, productId, qty?)
    /// </summary>
    [HttpPost("{userId}/items")]
    public async Task<ActionResult<ApiResponse<object>>> AddToCart([FromRoute] string userId, [FromBody] AddToCartRequest req)
    {
        if (req.Qty < 1)
            return BadRequest(ApiResponse<object>.Fail("Quantity must be at least 1."));

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == req.ProductId);
        if (product is null)
            return NotFound(ApiResponse<object>.Fail("Product not found."));

        if (product.Stock == 0)
            return BadRequest(ApiResponse<object>.Fail("Sorry, this item is out of stock."));

        var existing = await db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == req.ProductId);
        if (existing is not null)
        {
            var newQty = existing.Quantity + req.Qty;
            if (newQty > product.Stock)
            {
                return BadRequest(ApiResponse<object>.Fail($"Only {product.Stock} unit(s) available. You already have {existing.Quantity} in cart."));
            }

            existing.Quantity = newQty;
            await db.SaveChangesAsync();
            return ApiResponse<object>.Ok(new { productId = req.ProductId, qty = existing.Quantity }, "Item added to cart.");
        }

        if (req.Qty > product.Stock)
            return BadRequest(ApiResponse<object>.Fail($"Only {product.Stock} unit(s) available."));

        db.CartItems.Add(new CartItem
        {
            UserId = userId,
            ProductId = req.ProductId,
            Quantity = req.Qty,
            AddedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { productId = req.ProductId, qty = req.Qty }, "Item added to cart.");
    }

    public record UpdateQtyRequest(int Qty);

    /// <summary>
    /// Match mock: updateCartQty(userId, productId, qty)
    /// </summary>
    [HttpPut("{userId}/items/{productId}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateQty([FromRoute] string userId, [FromRoute] string productId, [FromBody] UpdateQtyRequest req)
    {
        if (req.Qty < 1)
            return BadRequest(ApiResponse<object>.Fail("Quantity must be at least 1."));

        var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == productId);
        if (product is null)
            return NotFound(ApiResponse<object>.Fail("Product not found."));

        if (req.Qty > product.Stock)
            return BadRequest(ApiResponse<object>.Fail($"Only {product.Stock} unit(s) available."));

        var item = await db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);
        if (item is null)
            return NotFound(ApiResponse<object>.Fail("Item not found in cart."));

        item.Quantity = req.Qty;
        await db.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { productId, qty = req.Qty }, "Cart updated.");
    }

    /// <summary>
    /// Match mock: removeFromCart(userId, productId)
    /// </summary>
    [HttpDelete("{userId}/items/{productId}")]
    public async Task<ActionResult<ApiResponse<object?>>> Remove([FromRoute] string userId, [FromRoute] string productId)
    {
        var item = await db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);
        if (item is null)
            return NotFound(ApiResponse<object?>.Fail("Item not found in cart."));

        db.CartItems.Remove(item);
        await db.SaveChangesAsync();

        return ApiResponse<object?>.Ok(null, "Item removed from cart.");
    }

    /// <summary>
    /// Convenience: clear entire cart for a user.
    /// </summary>
    [HttpDelete("{userId}")]
    public async Task<ActionResult<ApiResponse<object?>>> Clear([FromRoute] string userId)
    {
        var items = await db.CartItems.Where(c => c.UserId == userId).ToListAsync();
        if (items.Count == 0)
            return ApiResponse<object?>.Ok(null, "Cart cleared.");

        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync();

        return ApiResponse<object?>.Ok(null, "Cart cleared.");
    }
}
