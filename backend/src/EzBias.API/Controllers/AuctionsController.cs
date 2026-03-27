using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController(EzBiasDbContext db) : ControllerBase
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
        var q = db.Auctions.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(fandom))
            q = q.Where(a => a.Fandom.ToLower() == fandom.ToLower());

        if (isLive is not null)
            q = q.Where(a => a.IsLive == isLive.Value);

        if (isUrgent == true)
            q = q.Where(a => a.IsUrgent);

        var results = await q
            .OrderBy(a => a.EndsAt)
            .Select(a => new AuctionDto(
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
            ))
            .ToListAsync();

        return ApiResponse<IReadOnlyList<AuctionDto>>.Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AuctionDetailDto>>> GetAuctionById([FromRoute] string id)
    {
        var auction = await db.Auctions.AsNoTracking()
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == id);

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
        if (string.IsNullOrWhiteSpace(req.UserId))
            return BadRequest(ApiResponse<BidDto>.Fail("User not found. Please log in."));

        var auction = await db.Auctions.Include(a => a.Bids).FirstOrDefaultAsync(a => a.Id == auctionId);
        if (auction is null)
            return NotFound(ApiResponse<BidDto>.Fail("Auction not found."));

        if (!auction.IsLive)
            return BadRequest(ApiResponse<BidDto>.Fail("This auction has ended."));

        var minBid = auction.CurrentBid + 5m;
        if (req.Amount < minBid)
            return BadRequest(ApiResponse<BidDto>.Fail($"Bid must be at least ${minBid:0.00} (current bid + $5.00)."));

        if (auction.SellerId == req.UserId)
            return BadRequest(ApiResponse<BidDto>.Fail("You cannot bid on your own listing."));

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == req.UserId);
        if (user is null)
            return BadRequest(ApiResponse<BidDto>.Fail("User not found. Please log in."));

        // mark previous winning bids
        foreach (var b in auction.Bids)
            b.IsWinning = false;

        var nextBidId = await NextIdAsync("b", db.Bids.Select(b => b.Id));

        var bid = new Bid
        {
            Id = nextBidId,
            AuctionId = auction.Id,
            UserId = user.Id,
            Username = user.Username,
            Avatar = user.Avatar,
            AvatarBg = user.AvatarBg,
            Amount = req.Amount,
            PlacedAt = DateTime.UtcNow,
            IsWinning = true
        };

        auction.Bids.Add(bid);
        auction.CurrentBid = req.Amount;

        await db.SaveChangesAsync();

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
