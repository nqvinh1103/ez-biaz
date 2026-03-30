namespace EzBias.Contracts.Features.Subscriptions.Dtos;

public record SubscribeRequest(string PlanId);

public record SubscriptionDto(
    string Id,
    string UserId,
    string PlanId,
    string Status,
    string StartsAt,
    string EndsAt
);
