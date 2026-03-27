using EzBias.API.Models;
using EzBias.API.Models.Dtos;
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
        var entities = await auctions.GetAuctionsAsync(fandom, isLive, isUrgent);
        var results = entities.Select(a => new AuctionDto(
            a.Id,
            a.Fandom,
            a.Artist,
            a.Name,
            a.Description,
            a.FloorPrice,
            a.CurrentBid,
            a.SellerId,
            a.EndsAt,
            a.Image,
            a.IsUrgent,
            a.IsLive,
            a.ContainImage
        )).ToList();

        return ApiResponse<IReadOnlyList<AuctionDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AuctionDetailDto>>> GetAuctionById([FromRoute] string id)
    {
        var auction = await auctions.GetAuctionDetailAsync(id);

        if (auction is null)
            return NotFound(ApiResponse<AuctionDetailDto>.Fail("Auction not found."));

        var bids = auction.Bids
            .OrderByDescending(b => b.PlacedAt)
            .Select(b => new BidDto(
                b.Id,
                b.AuctionId,
                b.UserId,
                b.Username,
                b.Avatar,
                b.AvatarBg,
                b.Amount,
                b.PlacedAt,
                b.IsWinning
            ))
            .ToList();

        var dto = new AuctionDetailDto(
            auction.Id,
            auction.Fandom,
            auction.Artist,
            auction.Name,
            auction.Description,
            auction.FloorPrice,
            auction.CurrentBid,
            auction.SellerId,
            auction.EndsAt,
            auction.Image,
            auction.IsUrgent,
            auction.IsLive,
            auction.ContainImage,
            bids
        );

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
            var bid = await auctions.PlaceBidAsync(auctionId, req.UserId, req.Amount);

            var dto = new BidDto(
                bid.Id,
                bid.AuctionId,
                bid.UserId,
                bid.Username,
                bid.Avatar,
                bid.AvatarBg,
                bid.Amount,
                bid.PlacedAt,
                bid.IsWinning
            );

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
