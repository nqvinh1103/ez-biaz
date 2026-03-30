namespace EzBias.Contracts.Features.Assistant.Dtos;

public record AssistantChatRequest(
    string Message,
    string? ConversationId
);

public record AssistantChatResponse(
    string ConversationId,
    string Reply,
    IReadOnlyList<AssistantLinkDto> Links
);

public record AssistantLinkDto(
    string Title,
    string Url
);
