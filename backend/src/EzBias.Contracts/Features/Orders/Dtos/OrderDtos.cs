namespace EzBias.Contracts.Features.Orders.Dtos;

public record CheckoutRequest(
    string UserId,
    ShippingInfo ShippingInfo,
    string PaymentMethod,
    IReadOnlyList<CheckoutItem>? Items
);

public record ShippingInfo(
    string FullName,
    string Email,
    string Address,
    string City,
    string Zip,
    string Phone
);

public record CheckoutItem(
    string ProductId,
    string Name,
    decimal Price,
    int Qty
);

public record OrderItemDto(
    string ProductId,
    string Name,
    int Qty,
    decimal Price,
    string Image
);

public record CheckoutResultDto(
    IReadOnlyList<OrderDto> Orders
);

public record OrderDto(
    string Id,
    string UserId,
    string SellerId,
    IReadOnlyList<OrderItemDto> Items,
    decimal ShippingFee,
    decimal Total,
    string Status,
    string Payment,
    string Address,
    string CreatedAt,
    string? Carrier,
    string? TrackingNumber,
    string? ShippedAt,
    string? DeliveredAt
);
