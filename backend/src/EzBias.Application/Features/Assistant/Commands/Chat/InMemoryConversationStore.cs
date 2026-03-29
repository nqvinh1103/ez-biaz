using EzBias.Application.Common.Interfaces.AI;
using System.Collections.Concurrent;

namespace EzBias.Application.Features.Assistant.Commands.Chat;

public interface IConversationStore
{
    (string conversationId, List<ChatMessage> history) GetOrCreate(string? conversationId);
    void Append(string conversationId, ChatMessage message);
    IReadOnlyList<ChatMessage> GetHistory(string conversationId);
}

public class InMemoryConversationStore : IConversationStore
{
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _conversations = new();

    public (string conversationId, List<ChatMessage> history) GetOrCreate(string? conversationId)
    {
        var id = string.IsNullOrWhiteSpace(conversationId) ? Guid.NewGuid().ToString("N") : conversationId;
        var history = _conversations.GetOrAdd(id, _ => new List<ChatMessage>());
        return (id, history);
    }

    public void Append(string conversationId, ChatMessage message)
    {
        var history = _conversations.GetOrAdd(conversationId, _ => new List<ChatMessage>());
        lock (history)
        {
            history.Add(message);
            // keep last 20 messages
            if (history.Count > 20) history.RemoveRange(0, history.Count - 20);
        }
    }

    public IReadOnlyList<ChatMessage> GetHistory(string conversationId)
    {
        if (!_conversations.TryGetValue(conversationId, out var history)) return Array.Empty<ChatMessage>();
        lock (history) return history.ToList();
    }
}
