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
    string Description,
    string CreatedAt,
    bool IsAuction
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
