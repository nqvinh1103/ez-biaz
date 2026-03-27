using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.Infrastructure.Repositories;

public class UserRepository(EzBiasDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
}
