using EzBias.Application.Common.Interfaces.AI;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace EzBias.Infrastructure.AI;

public class GeminiChatClient(HttpClient http, IConfiguration config) : IChatModelClient
{
    private readonly string _apiKey = config["Gemini:ApiKey"] ?? string.Empty;
    private readonly string _model = config["Gemini:Model"] ?? "gemini-1.5-flash";

    public async Task<string> GenerateAsync(IReadOnlyList<ChatMessage> messages, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException("Missing Gemini:ApiKey configuration.");

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

        var contents = messages.Select(m => new
        {
            role = m.Role, // user|model
            parts = new[] { new { text = m.Content } }
        });

        var payload = new
        {
            contents,
            generationConfig = new
            {
                temperature = 0.3,
                maxOutputTokens = 512
            }
        };

        using var res = await http.PostAsJsonAsync(url, payload, cancellationToken);
        var body = await res.Content.ReadAsStringAsync(cancellationToken);

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"Gemini request failed (HTTP {(int)res.StatusCode}): {body}");

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        var text = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? string.Empty;
    }
}
