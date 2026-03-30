using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Subscriptions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Subscriptions.Commands.CancelSubscription;

public class CancelSubscriptionCommandHandler(ISubscriptionRepository repo) : IRequestHandler<CancelSubscriptionCommand, SubscriptionDto?>
{
    public async Task<SubscriptionDto?> Handle(CancelSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var active = await repo.GetActiveAsync(request.UserId, cancellationToken);
        if (active is null) return null;

        active.Status = "canceled";
        active.UpdatedAt = DateTime.UtcNow;

        await repo.SaveChangesAsync(cancellationToken);

        return new SubscriptionDto(
            active.Id,
            active.UserId,
            active.PlanId,
            active.Status,
            active.StartsAt.ToString("o"),
            active.EndsAt.ToString("o")
        );
    }
}
