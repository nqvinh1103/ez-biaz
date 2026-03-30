using EzBias.API.Models;
using EzBias.Application.Features.Products.Commands.CreateListing;
using EzBias.Application.Features.Products.Commands.DeleteListing;
using EzBias.Application.Features.Products.Commands.UpdateListing;
using EzBias.Application.Features.Products.Models;
using EzBias.Application.Features.Products.Queries.GetProductById;
using EzBias.Application.Features.Products.Queries.GetProducts;
using EzBias.Application.Features.Products.Queries.GetSellerListings;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IMediator mediator, EzBias.Application.Common.Interfaces.Storage.IImageStorage images) : ControllerBase
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
        [FromQuery] bool? inStockOnly,
        [FromQuery] bool? boostedFirst)
    {
        var results = await mediator.Send(new GetProductsQuery(fandom, type, minPrice, maxPrice, inStockOnly, boostedFirst));

        if (results.Count == 0)
            return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results, "No products found for the selected filters.");

        return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductById([FromRoute] string id)
    {
        var dto = await mediator.Send(new GetProductByIdQuery(id));
        if (dto is null)
            return NotFound(ApiResponse<ProductDto>.Fail("Product not found."));

        return ApiResponse<ProductDto>.Ok(dto);
    }

    /// <summary>
    /// Match mock: getListingsByUser(userId)
    /// </summary>
    [HttpGet("seller/{userId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductDto>>>> GetSellerListings([FromRoute] string userId)
    {
        var results = await mediator.Send(new GetSellerListingsQuery(userId));
        return ApiResponse<IReadOnlyList<ProductDto>>.Ok(results);
    }

    /// <summary>
    /// Match mock: createListing(userId, listingData)
    /// </summary>
    public class CreateListingForm
    {
        [FromForm(Name = "name")] public string Name { get; set; } = string.Empty;
        [FromForm(Name = "condition")] public string Condition { get; set; } = string.Empty;
        [FromForm(Name = "price")] public decimal Price { get; set; }
        [FromForm(Name = "stock")] public int Stock { get; set; } = 1;
        [FromForm(Name = "fandom")] public string Fandom { get; set; } = string.Empty;
        [FromForm(Name = "itemTypes")] public List<string> ItemTypes { get; set; } = new();
        [FromForm(Name = "description")] public string? Description { get; set; }

        // multiple files: formData.append('images', file)
        [FromForm(Name = "images")] public List<IFormFile> Images { get; set; } = new();
    }

    /// <summary>
    /// Create listing with optional multiple images (multipart/form-data).
    /// </summary>
    [HttpPost("seller/{userId}")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateListing([FromRoute] string userId, [FromForm] CreateListingForm req)
    {
        try
        {
            var imageUrls = new List<string>();

            // Validate and upload images (max 5MB each)
            foreach (var file in req.Images.Take(5))
            {
                if (file.Length == 0) continue;
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(ApiResponse<ProductDto>.Fail("Each image must be 5MB or less."));

                var ct = file.ContentType?.ToLowerInvariant() ?? string.Empty;
                var allowed = ct is "image/jpeg" or "image/jpg" or "image/png" or "image/webp";
                if (!allowed)
                    return BadRequest(ApiResponse<ProductDto>.Fail("Only JPG, PNG, or WEBP images are allowed."));

                await using var stream = file.OpenReadStream();
                var url = await images.UploadImageAsync(stream, file.FileName, file.ContentType ?? "application/octet-stream", "ez-biaz/listings");
                imageUrls.Add(url);
            }

            var dto = await mediator.Send(new CreateListingCommand(userId, new CreateListingModel(
                req.Name,
                req.Condition,
                req.Price,
                req.Stock,
                req.Fandom,
                req.ItemTypes,
                req.Description,
                imageUrls.Count > 0 ? imageUrls : null
            )));

            return ApiResponse<ProductDto>.Ok(dto, "Your listing has been posted successfully!");
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
            var dto = await mediator.Send(new UpdateListingCommand(userId, productId, new UpdateListingModel(
                req.Name,
                req.Description,
                req.Condition,
                req.Price,
                req.Stock
            )));
            if (dto is null)
                return NotFound(ApiResponse<ProductDto>.Fail("Listing not found."));

            return ApiResponse<ProductDto>.Ok(dto, "Listing updated successfully.");
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
            var ok = await mediator.Send(new DeleteListingCommand(userId, productId));
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
