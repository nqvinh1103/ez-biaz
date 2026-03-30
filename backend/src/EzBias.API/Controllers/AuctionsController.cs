using EzBias.API.Models;
using EzBias.Application.Features.Auctions.Commands.CreateAuction;
using EzBias.Application.Features.Auctions.Commands.PlaceBid;
using EzBias.Application.Features.Auctions.Queries.GetAuctionById;
using EzBias.Application.Features.Auctions.Queries.GetAuctions;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<AuctionDetailDto>>> CreateAuction([FromBody] CreateAuctionRequest req)
    {
        try
        {
            var dto = await mediator.Send(new CreateAuctionCommand(req.SellerId, req.ProductId, req.DurationHours, req.DurationSeconds, req.IsUrgent));
            return ApiResponse<AuctionDetailDto>.Ok(dto, "Auction created.");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<AuctionDetailDto>.Fail(ex.Message));
        }
    }

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
        var results = await mediator.Send(new GetAuctionsQuery(fandom, isLive, isUrgent));
        return ApiResponse<IReadOnlyList<AuctionDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AuctionDetailDto>>> GetAuctionById([FromRoute] string id)
    {
        var dto = await mediator.Send(new GetAuctionByIdQuery(id));

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
            var dto = await mediator.Send(new PlaceBidCommand(auctionId, req.UserId, req.Amount));
            return ApiResponse<BidDto>.Ok(dto, $"Bid of ${req.Amount:0.00} placed successfully!");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<BidDto>.Fail(ex.Message));
        }
    }
}
