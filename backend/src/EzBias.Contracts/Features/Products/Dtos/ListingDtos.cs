namespace EzBias.Contracts.Features.Products.Dtos;

public record CreateListingRequest(
    string Name,
    string Condition,
    decimal Price,
    int Stock,
    string Fandom,
    IReadOnlyList<string> ItemTypes,
    string? Description
);

public record UpdateListingRequest(
    string? Name,
    string? Description,
    string? Condition,
    decimal? Price,
    int? Stock
);
