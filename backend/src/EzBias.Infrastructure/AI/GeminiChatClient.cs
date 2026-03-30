using EzBias.Application.Common.Interfaces.AI;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace EzBias.Infrastructure.AI;

public class GeminiChatClient(HttpClient http, IConfiguration config) : IChatModelClient
{
    private readonly string _apiKey = config["Gemini:ApiKey"] ?? string.Empty;
    // Gemini model ids change over time; use *-latest by default.
    private readonly string _model = config["Gemini:Model"] ?? "gemini-1.5-flash-latest";

    public async Task<string> GenerateAsync(IReadOnlyList<ChatMessage> messages, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException("Missing Gemini:ApiKey configuration.");

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

        // NOTE: If you see 404 model not found, set Gemini:Model to an available model id.
        // You can list models via: GET https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY

        // Gemini expects roles: user | model
        var contents = messages.Select(m => new
        {
            role = m.Role,
            parts = new[] { new { text = m.Content } }
        });

        var payload = new
        {
            contents,
            generationConfig = new
            {
                temperature = 0.2,
                maxOutputTokens = 512,
                responseMimeType = "application/json"
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
