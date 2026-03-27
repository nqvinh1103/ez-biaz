using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Domain.Entities;
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

    /// <summary>
    /// Match mock: createListing(userId, listingData)
    /// </summary>
    [HttpPost("seller/{userId}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateListing([FromRoute] string userId, [FromBody] CreateListingRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(ApiResponse<ProductDto>.Fail("Product name is required."));
        if (string.IsNullOrWhiteSpace(req.Condition))
            return BadRequest(ApiResponse<ProductDto>.Fail("Please select the item condition."));
        if (req.Price <= 0)
            return BadRequest(ApiResponse<ProductDto>.Fail("Please enter a valid price greater than $0."));
        if (string.IsNullOrWhiteSpace(req.Fandom))
            return BadRequest(ApiResponse<ProductDto>.Fail("Please specify the fandom / group."));
        if (req.ItemTypes is null || req.ItemTypes.Count == 0)
            return BadRequest(ApiResponse<ProductDto>.Fail("Please select at least one item type."));

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return BadRequest(ApiResponse<ProductDto>.Fail("You must be logged in to create a listing."));

        var nextId = await NextIdAsync("p", db.Products.Select(p => p.Id));
        var name = req.Name.Trim();
        var fandom = req.Fandom.Trim();

        var newProduct = new Product
        {
            Id = nextId,
            Fandom = fandom,
            Artist = fandom,
            Name = name,
            Type = req.ItemTypes[0],
            Condition = req.Condition,
            Price = decimal.Round(req.Price, 2),
            Stock = 1,
            SellerId = userId,
            Image = "https://placehold.co/300x300/e8e0f7/7c5cbf?text=" + Uri.EscapeDataString(name.Length > 12 ? name[..12] : name),
            Description = req.Description ?? string.Empty,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        db.Products.Add(newProduct);
        await db.SaveChangesAsync();

        var dto = new ProductDto(
            newProduct.Id,
            newProduct.Fandom,
            newProduct.Artist,
            newProduct.Name,
            newProduct.Type,
            newProduct.Condition,
            newProduct.Price,
            newProduct.Stock,
            newProduct.SellerId,
            newProduct.Image,
            newProduct.Description,
            newProduct.CreatedAt.ToString("yyyy-MM-dd")
        );

        return ApiResponse<ProductDto>.Ok(dto, "Your listing has been posted successfully!");
    }

    /// <summary>
    /// Match mock: updateListing(userId, productId, updates)
    /// </summary>
    [HttpPut("seller/{userId}/{productId}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateListing([FromRoute] string userId, [FromRoute] string productId, [FromBody] UpdateListingRequest req)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product is null)
            return NotFound(ApiResponse<ProductDto>.Fail("Listing not found."));
        if (product.SellerId != userId)
            return Forbid();

        if (req.Name is not null) product.Name = req.Name;
        if (req.Description is not null) product.Description = req.Description;
        if (req.Condition is not null) product.Condition = req.Condition;
        if (req.Price is not null) product.Price = decimal.Round(req.Price.Value, 2);
        if (req.Stock is not null) product.Stock = req.Stock.Value;
        product.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var dto = new ProductDto(
            product.Id,
            product.Fandom,
            product.Artist,
            product.Name,
            product.Type,
            product.Condition,
            product.Price,
            product.Stock,
            product.SellerId,
            product.Image,
            product.Description,
            product.CreatedAt.ToString("yyyy-MM-dd")
        );

        return ApiResponse<ProductDto>.Ok(dto, "Listing updated successfully.");
    }

    /// <summary>
    /// Match mock: deleteListing(userId, productId)
    /// </summary>
    [HttpDelete("seller/{userId}/{productId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteListing([FromRoute] string userId, [FromRoute] string productId)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product is null)
            return NotFound(ApiResponse<object>.Fail("Listing not found."));
        if (product.SellerId != userId)
            return Forbid();

        db.Products.Remove(product);
        await db.SaveChangesAsync();

        return ApiResponse<object>.Ok(null, "Listing deleted successfully.");
    }

    private static async Task<string> NextIdAsync(string prefix, IQueryable<string> ids)
    {
        var list = await ids.ToListAsync();
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[prefix.Length..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return prefix + (max + 1);
    }
}
