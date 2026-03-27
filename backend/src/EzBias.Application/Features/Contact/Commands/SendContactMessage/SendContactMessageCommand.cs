using MediatR;

namespace EzBias.Application.Features.Contact.Commands.SendContactMessage;

public record SendContactMessageCommand(string Name, string Email, string Message) : IRequest<Unit>;
