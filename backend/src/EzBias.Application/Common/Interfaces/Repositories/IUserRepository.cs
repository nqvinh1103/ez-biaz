using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
}
