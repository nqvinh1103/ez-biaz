namespace EzBias.Application.Common.Interfaces.Services;

public interface IContactService
{
    Task SendAsync(string name, string email, string message, CancellationToken cancellationToken = default);
}
