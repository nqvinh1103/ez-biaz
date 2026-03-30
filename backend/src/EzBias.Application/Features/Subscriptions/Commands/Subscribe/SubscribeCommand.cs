using EzBias.Contracts.Features.Subscriptions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Subscriptions.Commands.Subscribe;

public record SubscribeCommand(string UserId, string PlanId) : IRequest<SubscriptionDto>;
