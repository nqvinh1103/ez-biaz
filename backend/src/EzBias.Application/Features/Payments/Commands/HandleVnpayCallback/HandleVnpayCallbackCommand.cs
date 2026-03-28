using MediatR;

namespace EzBias.Application.Features.Payments.Commands.HandleVnpayCallback;

public record HandleVnpayCallbackCommand(IReadOnlyDictionary<string, string?> Query) : IRequest<Unit>;
