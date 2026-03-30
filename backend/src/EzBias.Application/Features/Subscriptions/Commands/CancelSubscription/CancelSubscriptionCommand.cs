using EzBias.Contracts.Features.Subscriptions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Subscriptions.Commands.CancelSubscription;

public record CancelSubscriptionCommand(string UserId) : IRequest<SubscriptionDto?>;
