namespace EzBias.Application.Features.Orders.Models;

public record ShippingInfoModel(
    string FullName,
    string Email,
    string Address,
    string City,
    string Zip,
    string Phone
);

public record CheckoutItemModel(
    string ProductId,
    string Name,
    decimal Price,
    int Qty
);

public record CheckoutModel(
    string UserId,
    ShippingInfoModel ShippingInfo,
    string PaymentMethod,
    IReadOnlyList<CheckoutItemModel>? Items
);
