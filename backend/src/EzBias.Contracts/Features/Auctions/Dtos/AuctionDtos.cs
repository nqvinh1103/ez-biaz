namespace EzBias.Contracts.Features.Auctions.Dtos;

public record AuctionDto(
    string Id,
    string? ProductId,
    string Fandom,
    string Artist,
    string Name,
    string Description,
    decimal FloorPrice,
    decimal CurrentBid,
    string SellerId,
    DateTime EndsAt,
    string Image,
    bool IsUrgent,
    bool IsLive,
    bool ContainImage
);

public record BidDto(
    string Id,
    string AuctionId,
    string UserId,
    string Username,
    string Avatar,
    string AvatarBg,
    decimal Amount,
    DateTime PlacedAt,
    bool IsWinning
);

public record CreateAuctionRequest(
    string SellerId,
    string ProductId,
    int? DurationHours,
    int? DurationSeconds,
    bool IsUrgent
);

public record AuctionDetailDto(
    string Id,
    string? ProductId,
    string Fandom,
    string Artist,
    string Name,
    string Description,
    decimal FloorPrice,
    decimal CurrentBid,
    string SellerId,
    DateTime EndsAt,
    string Image,
    bool IsUrgent,
    bool IsLive,
    bool ContainImage,
    IReadOnlyList<BidDto> Bids
);
