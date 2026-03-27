using EzBias.API.Models;
using EzBias.Application.Features.Products.Dtos;
using EzBias.Application.Common.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService products) : ControllerBase
{
    private static ProductDto ToDto(EzBias.Domain.Entities.Product p) => new(
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
        var entities = await products.GetProductsAsync(fandom, type, minPrice, maxPrice, inStockOnly);
        var results = entities.Select(ToDto).ToList();

        if (results.Count == 0)
            return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results, "No products found for the selected filters.");

        return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductById([FromRoute] string id)
    {
        var entity = await products.GetByIdAsync(id);
        if (entity is null)
            return NotFound(ApiResponse<ProductDto>.Fail("Product not found."));

        return ApiResponse<ProductDto>.Ok(ToDto(entity));
    }

    /// <summary>
    /// Match mock: getListingsByUser(userId)
    /// </summary>
    [HttpGet("seller/{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductDto>>>> GetSellerListings([FromRoute] string userId)
    {
        var entities = await products.GetBySellerAsync(userId);
        var results = entities.Select(ToDto).ToList();
        return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results);
    }

    /// <summary>
    /// Match mock: createListing(userId, listingData)
    /// </summary>
    [HttpPost("seller/{userId}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateListing([FromRoute] string userId, [FromBody] CreateListingRequest req)
    {
        try
        {
            var entity = await products.CreateListingAsync(userId, new EzBias.Application.Features.Products.Models.CreateListingModel(
                req.Name,
                req.Condition,
                req.Price,
                req.Fandom,
                req.ItemTypes,
                req.Description
            ));
            return ApiResponse<ProductDto>.Ok(ToDto(entity), "Your listing has been posted successfully!");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<ProductDto>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Match mock: updateListing(userId, productId, updates)
    /// </summary>
    [HttpPut("seller/{userId}/{productId}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateListing([FromRoute] string userId, [FromRoute] string productId, [FromBody] UpdateListingRequest req)
    {
        try
        {
            var entity = await products.UpdateListingAsync(userId, productId, new EzBias.Application.Features.Products.Models.UpdateListingModel(
                req.Name,
                req.Description,
                req.Condition,
                req.Price,
                req.Stock
            ));
            if (entity is null)
                return NotFound(ApiResponse<ProductDto>.Fail("Listing not found."));

            return ApiResponse<ProductDto>.Ok(ToDto(entity), "Listing updated successfully.");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<ProductDto>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Match mock: deleteListing(userId, productId)
    /// </summary>
    [HttpDelete("seller/{userId}/{productId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteListing([FromRoute] string userId, [FromRoute] string productId)
    {
        try
        {
            var ok = await products.DeleteListingAsync(userId, productId);
            if (!ok)
                return NotFound(ApiResponse<object>.Fail("Listing not found."));

            return ApiResponse<object>.Ok(null, "Listing deleted successfully.");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
