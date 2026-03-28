namespace EzBias.Contracts.Features.Orders.Dtos;

public record SoldItemDto(
    string OrderId,
    string BuyerId,
    string ProductId,
    string Name,
    int Qty,
    decimal Price,
    string Image,
    string SoldAt
);
