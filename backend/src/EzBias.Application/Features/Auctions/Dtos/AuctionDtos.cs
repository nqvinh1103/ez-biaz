namespace EzBias.Application.Features.Auctions.Dtos;

public record AuctionDto(
    string Id,
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

public record AuctionDetailDto(
    string Id,
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
