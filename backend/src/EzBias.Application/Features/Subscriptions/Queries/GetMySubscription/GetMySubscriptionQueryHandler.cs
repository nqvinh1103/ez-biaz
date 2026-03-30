using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Subscriptions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Subscriptions.Queries.GetMySubscription;

public class GetMySubscriptionQueryHandler(ISubscriptionRepository repo) : IRequestHandler<GetMySubscriptionQuery, SubscriptionDto?>
{
    public Task<SubscriptionDto?> Handle(GetMySubscriptionQuery request, CancellationToken cancellationToken)
        => repo.GetActiveDtoAsync(request.UserId, cancellationToken);
}
