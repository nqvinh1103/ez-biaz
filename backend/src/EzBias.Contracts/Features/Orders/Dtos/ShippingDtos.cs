namespace EzBias.Contracts.Features.Orders.Dtos;

public record ShipOrderRequest(
    string SellerId,
    string? Carrier,
    string? TrackingNumber
);

public record ReceiveOrderRequest(
    string BuyerId
);
