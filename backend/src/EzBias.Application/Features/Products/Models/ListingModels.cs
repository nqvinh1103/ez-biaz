namespace EzBias.Application.Features.Products.Models;

public record CreateListingModel(
    string Name,
    string Condition,
    decimal Price,
    string Fandom,
    IReadOnlyList<string> ItemTypes,
    string? Description
);

public record UpdateListingModel(
    string? Name,
    string? Description,
    string? Condition,
    decimal? Price,
    int? Stock
);
