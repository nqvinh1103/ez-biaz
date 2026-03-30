using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Subscriptions.Dtos;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Subscriptions.Commands.Subscribe;

public class SubscribeCommandHandler(ISubscriptionRepository repo) : IRequestHandler<SubscribeCommand, SubscriptionDto>
{
    public async Task<SubscriptionDto> Handle(SubscribeCommand request, CancellationToken cancellationToken)
    {
        var planId = (request.PlanId ?? string.Empty).Trim().ToLowerInvariant();
        if (planId is not ("boost" or "premium"))
            throw new ArgumentException("Invalid planId. Allowed: boost | premium.");

        var now = DateTime.UtcNow;
        var endsAt = planId == "boost" ? now.AddHours(24) : now.AddDays(30);

        // Cancel existing active subscription (simple model: 1 active at a time)
        var active = await repo.GetActiveAsync(request.UserId, cancellationToken);
        if (active is not null)
        {
            active.Status = "canceled";
            active.UpdatedAt = now;
        }

        var id = await repo.NextSubscriptionIdAsync(cancellationToken);
        var sub = new UserSubscription
        {
            Id = id,
            UserId = request.UserId,
            PlanId = planId,
            Status = "active",
            StartsAt = now,
            EndsAt = endsAt,
            CreatedAt = now
        };

        await repo.AddAsync(sub, cancellationToken);
        await repo.SaveChangesAsync(cancellationToken);

        return new SubscriptionDto(
            sub.Id,
            sub.UserId,
            sub.PlanId,
            sub.Status,
            sub.StartsAt.ToString("o"),
            sub.EndsAt.ToString("o")
        );
    }
}
