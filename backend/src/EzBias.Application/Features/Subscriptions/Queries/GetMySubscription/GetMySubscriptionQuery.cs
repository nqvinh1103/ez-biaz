using EzBias.Contracts.Features.Subscriptions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Subscriptions.Queries.GetMySubscription;

public record GetMySubscriptionQuery(string UserId) : IRequest<SubscriptionDto?>;
