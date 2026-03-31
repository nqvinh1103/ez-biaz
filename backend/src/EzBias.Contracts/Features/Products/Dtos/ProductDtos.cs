namespace EzBias.Contracts.Features.Products.Dtos;

public record ProductDto(
    string Id,
    string Fandom,
    string Artist,
    string Name,
    string Type,
    string Condition,
    decimal Price,
    int Stock,
    string SellerId,
    string Image,
    IReadOnlyList<string> Images,
    string Description,
    string CreatedAt,
    bool IsAuction,
    bool IsBoosted,
    string? BoostEndsAt,
    SellerSummaryDto? SellerInfo = null,
    SellerRatingSummaryDto? SellerRatingSummary = null
);

public record SellerSummaryDto(
    string Id,
    string Username,
    string FullName,
    string Avatar,
    string JoinedAt
);

public record SellerRatingSummaryDto(
    decimal Average,
    int TotalReviews,
    IReadOnlyDictionary<int, int> Breakdown
);

public record CartItemDto(
    string ProductId,
    int Qty,
    string Name,
    string Artist,
    string Fandom,
    decimal Price,
    string Image,
    int Stock
);
