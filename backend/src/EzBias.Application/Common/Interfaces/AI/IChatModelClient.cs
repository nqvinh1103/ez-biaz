namespace EzBias.Application.Common.Interfaces.AI;

public record ChatMessage(string Role, string Content);

public interface IChatModelClient
{
    Task<string> GenerateAsync(
        IReadOnlyList<ChatMessage> messages,
        CancellationToken cancellationToken = default);
}
