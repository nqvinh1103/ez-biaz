namespace EzBias.Application.Features.Products.Models;

public record CreateListingModel(
    string Name,
    string Condition,
    decimal Price,
    int Stock,
    string Fandom,
    IReadOnlyList<string> ItemTypes,
    string? Description,
    IReadOnlyList<string>? ImageUrls
);

public record UpdateListingModel(
    string? Name,
    string? Description,
    string? Condition,
    decimal? Price,
    int? Stock
);
