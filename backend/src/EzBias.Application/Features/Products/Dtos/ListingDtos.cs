namespace EzBias.Application.Features.Products.Dtos;

public record CreateListingRequest(
    string Name,
    string Condition,
    decimal Price,
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
