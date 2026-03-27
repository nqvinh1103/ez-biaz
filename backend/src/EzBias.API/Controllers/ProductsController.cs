using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(EzBiasDbContext db) : ControllerBase
{
    /// <summary>
    /// Match mock: getProducts(filters?)
    /// Optional filters: fandom, type, minPrice, maxPrice, inStockOnly
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductDto>>>> GetProducts(
        [FromQuery] string? fandom,
        [FromQuery] string? type,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? inStockOnly)
    {
        var q = db.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(p => p.Fandom.ToLower() == fandom.ToLower());

        if (!string.IsNullOrWhiteSpace(type))
            q = q.Where(p => p.Type.ToLower() == type.ToLower());

        if (minPrice is not null)
            q = q.Where(p => p.Price >= minPrice.Value);

        if (maxPrice is not null)
            q = q.Where(p => p.Price <= maxPrice.Value);

        if (inStockOnly == true)
            q = q.Where(p => p.Stock > 0);

        var results = await q
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id,
                p.Fandom,
                p.Artist,
                p.Name,
                p.Type,
                p.Condition,
                p.Price,
                p.Stock,
                p.SellerId,
                p.Image,
                p.Description,
                p.CreatedAt.ToString("yyyy-MM-dd")
            ))
            .ToListAsync();

        if (results.Count == 0)
            return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results, "No products found for the selected filters.");

        return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductById([FromRoute] string id)
    {
        var p = await db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (p is null)
            return NotFound(ApiResponse<ProductDto>.Fail("Product not found."));

        var dto = new ProductDto(
            p.Id,
            p.Fandom,
            p.Artist,
            p.Name,
            p.Type,
            p.Condition,
            p.Price,
            p.Stock,
            p.SellerId,
            p.Image,
            p.Description,
            p.CreatedAt.ToString("yyyy-MM-dd")
        );

        return ApiResponse<ProductDto>.Ok(dto);
    }

    /// <summary>
    /// Match mock: getListingsByUser(userId)
    /// </summary>
    [HttpGet("seller/{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductDto>>>> GetSellerListings([FromRoute] string userId)
    {
        var results = await db.Products.AsNoTracking()
            .Where(p => p.SellerId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id,
                p.Fandom,
                p.Artist,
                p.Name,
                p.Type,
                p.Condition,
                p.Price,
                p.Stock,
                p.SellerId,
                p.Image,
                p.Description,
                p.CreatedAt.ToString("yyyy-MM-dd")
            ))
            .ToListAsync();

        return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results);
    }
}
