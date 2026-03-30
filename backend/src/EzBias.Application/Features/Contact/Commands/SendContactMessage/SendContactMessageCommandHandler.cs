using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities;
using MediatR;

namespace EzBias.Application.Features.Contact.Commands.SendContactMessage;

public class SendContactMessageCommandHandler(IContactRepository repo) : IRequestHandler<SendContactMessageCommand, Unit>
{
    public async Task<Unit> Handle(SendContactMessageCommand request, CancellationToken cancellationToken)
    {
        var nextId = await repo.NextIdAsync(cancellationToken);

        var entity = new ContactMessage
        {
            Id = nextId,
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Message = request.Message.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await repo.AddAsync(entity, cancellationToken);
        return Unit.Value;
    }
}
