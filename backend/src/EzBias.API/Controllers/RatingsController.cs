using System.Text.Json;
using EzBias.API.Models;
using EzBias.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController(EzBiasDbContext db) : ControllerBase
{
    public record SubmitRatingRequest(
        string OrderId,
        string SellerId,
        int ProductRating,
        int SellerRating,
        List<string>? Tags,
        string? Comment
    );

    public record RatingItemDto(
        string Id,
        string OrderId,
        string BuyerId,
        string? BuyerName,
        string SellerId,
        int ProductRating,
        int SellerRating,
        List<string> Tags,
        string? Comment,
        string? ProductName,
        DateTime CreatedAt
    );

    public record SellerRatingsDto(
        string SellerId,
        decimal AverageRating,
        int TotalReviews,
        IReadOnlyList<RatingItemDto> Items
    );

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RatingItemDto>>> Submit([FromBody] SubmitRatingRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.OrderId) || string.IsNullOrWhiteSpace(req.SellerId))
            return BadRequest(ApiResponse<RatingItemDto>.Fail("orderId and sellerId are required."));

        if (req.ProductRating is < 1 or > 5 || req.SellerRating is < 1 or > 5)
            return BadRequest(ApiResponse<RatingItemDto>.Fail("Rating must be between 1 and 5."));

        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == req.OrderId);

        if (order is null)
            return NotFound(ApiResponse<RatingItemDto>.Fail("Order not found."));

        if (!string.Equals(order.SellerId, req.SellerId, StringComparison.Ordinal))
            return BadRequest(ApiResponse<RatingItemDto>.Fail("sellerId does not match order."));

        if (!string.Equals(order.Status, "delivered", StringComparison.OrdinalIgnoreCase))
            return BadRequest(ApiResponse<RatingItemDto>.Fail("Order must be delivered before rating."));

        var existed = await db.Ratings.AnyAsync(x => x.OrderId == req.OrderId);
        if (existed)
            return BadRequest(ApiResponse<RatingItemDto>.Fail("This order has already been reviewed."));

        var tags = (req.Tags ?? new List<string>())
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(12)
            .ToList();

        var rating = new EzBias.Domain.Entities.Rating
        {
            Id = $"r_{Guid.NewGuid():N}",
            OrderId = order.Id,
            BuyerId = order.UserId,
            SellerId = order.SellerId,
            ProductRating = req.ProductRating,
            SellerRating = req.SellerRating,
            TagsJson = JsonSerializer.Serialize(tags),
            Comment = string.IsNullOrWhiteSpace(req.Comment) ? null : req.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        db.Ratings.Add(rating);
        await db.SaveChangesAsync();

        var buyerName = await db.Users.Where(u => u.Id == rating.BuyerId).Select(u => u.FullName).FirstOrDefaultAsync();
        var productName = order.Items.Select(i => i.Name).FirstOrDefault();

        var dto = new RatingItemDto(
            rating.Id,
            rating.OrderId,
            rating.BuyerId,
            buyerName,
            rating.SellerId,
            rating.ProductRating,
            rating.SellerRating,
            tags,
            rating.Comment,
            productName,
            rating.CreatedAt
        );

        return ApiResponse<RatingItemDto>.Ok(dto, "Review submitted successfully.");
    }

    [HttpGet("seller/{sellerId}")]
    public async Task<ActionResult<ApiResponse<SellerRatingsDto>>> GetSellerRatings([FromRoute] string sellerId)
    {
        var rows = await db.Ratings
            .Where(r => r.SellerId == sellerId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.OrderId,
                r.BuyerId,
                r.SellerId,
                r.ProductRating,
                r.SellerRating,
                r.TagsJson,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        var buyerIds = rows.Select(r => r.BuyerId).Distinct().ToList();
        var orderIds = rows.Select(r => r.OrderId).Distinct().ToList();

        var buyerNames = await db.Users
            .Where(u => buyerIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FullName })
            .ToDictionaryAsync(x => x.Id, x => x.FullName);

        var productNames = await db.OrderItems
            .Where(i => orderIds.Contains(i.OrderId))
            .GroupBy(i => i.OrderId)
            .Select(g => new { OrderId = g.Key, ProductName = g.Select(x => x.Name).FirstOrDefault() })
            .ToDictionaryAsync(x => x.OrderId, x => x.ProductName);

        var items = rows.Select(r => new RatingItemDto(
            r.Id,
            r.OrderId,
            r.BuyerId,
            buyerNames.TryGetValue(r.BuyerId, out var bn) ? bn : null,
            r.SellerId,
            r.ProductRating,
            r.SellerRating,
            DeserializeTags(r.TagsJson),
            r.Comment,
            productNames.TryGetValue(r.OrderId, out var pn) ? pn : null,
            r.CreatedAt
        )).ToList();

        var avg = items.Count == 0 ? 0 : Math.Round((decimal)items.Average(x => x.SellerRating), 1);

        var dto = new SellerRatingsDto(sellerId, avg, items.Count, items);
        return ApiResponse<SellerRatingsDto>.Ok(dto);
    }

    [HttpGet("order/{orderId}/check")]
    public async Task<ActionResult<ApiResponse<object>>> CheckOrderRated([FromRoute] string orderId)
    {
        var rated = await db.Ratings.AnyAsync(x => x.OrderId == orderId);
        return ApiResponse<object>.Ok(new { orderId, isRated = rated });
    }

    private static List<string> DeserializeTags(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}
