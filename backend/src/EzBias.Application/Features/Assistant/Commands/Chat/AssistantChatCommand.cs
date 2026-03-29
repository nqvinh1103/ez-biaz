using EzBias.Contracts.Features.Assistant.Dtos;
using MediatR;

namespace EzBias.Application.Features.Assistant.Commands.Chat;

public record AssistantChatCommand(
    string Message,
    string? ConversationId,
    string? UserId,
    string FrontendBaseUrl
) : IRequest<AssistantChatResponse>;
