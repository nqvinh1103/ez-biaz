using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Users.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class UserRepository(EzBiasDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<User?> GetTrackedByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task<MyProfileDto?> GetMyProfileDtoAsync(string id, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var row = await (
            from u in db.Users.AsNoTracking()
            where u.Id == id
            select new
            {
                User = u,
                Plan = (
                    from s in db.UserSubscriptions.AsNoTracking()
                    join p in db.SubscriptionPlans.AsNoTracking() on s.PlanId equals p.Id
                    where s.UserId == u.Id && s.Status == "active" && s.EndsAt > now
                    orderby s.StartsAt descending
                    select new MyPlanDto(
                        s.PlanId,
                        p.Name,
                        p.Price,
                        s.Status,
                        s.StartsAt.ToString("o"),
                        s.EndsAt.ToString("o")
                    )
                ).FirstOrDefault()
            }
        ).FirstOrDefaultAsync(cancellationToken);

        if (row is null) return null;

        var user = row.User;
        return new MyProfileDto(
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.Role,
            user.Avatar,
            user.AvatarBg,
            user.Phone,
            user.Address,
            user.City,
            user.Zip,
            user.BankName,
            user.BankAccountNumber,
            user.BankAccountName,
            row.Plan
        );
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
