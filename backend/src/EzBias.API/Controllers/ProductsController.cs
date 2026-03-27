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
public class ProductsController(IMediator mediator) : ControllerBase
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
        var results = await mediator.Send(new GetProductsQuery(fandom, type, minPrice, maxPrice, inStockOnly));

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
    [HttpPost("seller/{userId}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateListing([FromRoute] string userId, [FromBody] CreateListingRequest req)
    {
        try
        {
            var dto = await mediator.Send(new CreateListingCommand(userId, new CreateListingModel(
                req.Name,
                req.Condition,
                req.Price,
                req.Fandom,
                req.ItemTypes,
                req.Description
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
