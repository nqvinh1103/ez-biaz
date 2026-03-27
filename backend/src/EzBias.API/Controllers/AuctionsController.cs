using EzBias.API.Models;
using EzBias.Application.Features.Auctions.Dtos;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController(IAuctionService auctions) : ControllerBase
{
    /// <summary>
    /// Match mock: getAuctions(filters?)
    /// Optional filters: fandom, isLive, isUrgent
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AuctionDto>>>> GetAuctions(
        [FromQuery] string? fandom,
        [FromQuery] bool? isLive,
        [FromQuery] bool? isUrgent)
    {
        var results = await auctions.GetAuctionsAsync(fandom, isLive, isUrgent);
        return ApiResponse<IReadOnlyList<AuctionDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AuctionDetailDto>>> GetAuctionById([FromRoute] string id)
    {
        var dto = await auctions.GetAuctionDetailAsync(id);

        if (dto is null)
            return NotFound(ApiResponse<AuctionDetailDto>.Fail("Auction not found."));

        return ApiResponse<AuctionDetailDto>.Ok(dto);
    }

    public record PlaceBidRequest(string UserId, decimal Amount);

    /// <summary>
    /// Match mock: placeBid(userId, auctionId, amount)
    /// </summary>
    [HttpPost("{auctionId}/bids")]
    public async Task<ActionResult<ApiResponse<BidDto>>> PlaceBid([FromRoute] string auctionId, [FromBody] PlaceBidRequest req)
    {
        try
        {
            var dto = await auctions.PlaceBidAsync(auctionId, req.UserId, req.Amount);
            return ApiResponse<BidDto>.Ok(dto, $"Bid of ${req.Amount:0.00} placed successfully!");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<BidDto>.Fail(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<BidDto>.Fail(ex.Message));
        }
    }
}
