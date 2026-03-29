using EzBias.Application.Common.Interfaces.AI;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Assistant.Dtos;
using MediatR;

namespace EzBias.Application.Features.Assistant.Commands.Chat;

using System.Text.Json;

public class AssistantChatCommandHandler(
    IChatModelClient llm,
    IConversationStore store,
    IProductRepository products,
    IAuctionRepository auctions,
    IOrderRepository orders,
    ICartRepository carts,
    ISubscriptionRepository subs) : IRequestHandler<AssistantChatCommand, AssistantChatResponse>
{
    private record ToolPlan(
        string action,
        string? toolName,
        JsonElement? args,
        string? finalAnswer);

    public async Task<AssistantChatResponse> Handle(AssistantChatCommand request, CancellationToken cancellationToken)
    {
        var (cid, _) = store.GetOrCreate(request.ConversationId);
        var msg = request.Message.Trim();

        // Store user msg early so follow-up has context
        store.Append(cid, new ChatMessage("user", msg));

        var links = new List<AssistantLinkDto>();

        var system = BuildSystemPrompt(request.FrontendBaseUrl, request.UserId is not null);

        // 1) Ask Gemini to decide whether to call a tool
        var planJson = await llm.GenerateAsync(
            messages: BuildPlannerMessages(system, store.GetHistory(cid), msg),
            cancellationToken: cancellationToken);

        var plan = ParseToolPlan(planJson);

        if (string.Equals(plan.action, "answer", StringComparison.OrdinalIgnoreCase))
        {
            var answer = plan.finalAnswer ?? planJson;
            store.Append(cid, new ChatMessage("model", answer));
            return new AssistantChatResponse(cid, answer, links);
        }

        if (!string.Equals(plan.action, "tool", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(plan.toolName))
        {
            var answer = "Mình chưa hiểu rõ câu hỏi. Bạn nói rõ fandom/nhóm hoặc tầm giá giúp mình nhé.";
            store.Append(cid, new ChatMessage("model", answer));
            return new AssistantChatResponse(cid, answer, links);
        }

        // 2) Execute tool
        var toolName = plan.toolName.Trim();
        var toolResult = await ExecuteToolAsync(toolName, plan.args, request, links, cancellationToken);

        // 3) Ask Gemini to write final answer based on tool result
        var final = await llm.GenerateAsync(
            messages: BuildFinalMessages(system, store.GetHistory(cid), msg, toolName, toolResult),
            cancellationToken: cancellationToken);

        store.Append(cid, new ChatMessage("model", final));
        return new AssistantChatResponse(cid, final, links);
    }

    private static string BuildSystemPrompt(string frontendBaseUrl, bool hasAuth)
    {
        return $$"""
Bạn là trợ lý EzBias (marketplace K-pop).
Mục tiêu: trả lời chính xác và ngắn gọn.

Bạn có thể quyết định gọi tool để truy vấn database khi người dùng hỏi về sản phẩm/auction/đơn hàng/subscription/cart.
- Nếu không cần dữ liệu động (FAQ/policy/how-to) thì trả lời trực tiếp.

Yêu cầu:
- Luôn trả lời tiếng Việt.
- Nếu cần gợi ý sản phẩm/auction: trả tối đa 6 kết quả.
- Mỗi kết quả cần tên + giá (VND) + link.
- Link FE:
  - Product: {{frontendBaseUrl}}/product/<id>
  - Auction: {{frontendBaseUrl}}/auction/<id>

Bảo mật:
- Không bao giờ tiết lộ token, bank info, dữ liệu người dùng khác.
- Nếu câu hỏi cần dữ liệu cá nhân mà người dùng chưa đăng nhập thì yêu cầu đăng nhập.

Khi lập kế hoạch, CHỈ trả JSON đúng schema.
Schema ToolPlan:
{
  "action": "answer" | "tool",
  "toolName": string | null,
  "args": object | null,
  "finalAnswer": string | null
}

Tools:
- searchProducts { fandom?:string, artist?:string, keyword?:string, minPrice?:number, maxPrice?:number, type?:string, limit?:number }
- searchAuctions { fandom?:string, artist?:string, keyword?:string, minBid?:number, maxBid?:number, isLive?:boolean, limit?:number }
- getMyOrders { status?:string }
- getMyCart {}
- getMySubscription {}

AuthAvailable: {{hasAuth}}
""";
    }

    private static IReadOnlyList<ChatMessage> BuildPlannerMessages(string system, IReadOnlyList<ChatMessage> history, string msg)
    {
        // Gemini v1beta uses role=user|model
        var messages = new List<ChatMessage> { new("user", system) };
        messages.AddRange(history.TakeLast(10));
        messages.Add(new("user", msg));
        return messages;
    }

    private static IReadOnlyList<ChatMessage> BuildFinalMessages(string system, IReadOnlyList<ChatMessage> history, string msg, string toolName, string toolResult)
    {
        var messages = new List<ChatMessage> { new("user", system) };
        messages.AddRange(history.TakeLast(10));
        messages.Add(new("user", msg));
        messages.Add(new("user", $"ToolUsed: {toolName}\nToolResult(JSON): {toolResult}\nWrite the final answer to the user."));
        return messages;
    }

    private static ToolPlan ParseToolPlan(string text)
    {
        // Try parse raw JSON; if model wrapped in code fences, extract.
        var json = ExtractJson(text);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        string action = root.TryGetProperty("action", out var a) ? a.GetString() ?? "" : "";
        string? toolName = root.TryGetProperty("toolName", out var t) ? t.GetString() : null;
        JsonElement? args = root.TryGetProperty("args", out var ar) && ar.ValueKind != JsonValueKind.Null ? ar : null;
        string? finalAnswer = root.TryGetProperty("finalAnswer", out var fa) ? fa.GetString() : null;

        return new ToolPlan(action, toolName, args, finalAnswer);
    }

    private static string ExtractJson(string text)
    {
        var trimmed = text.Trim();
        if (trimmed.StartsWith("```"))
        {
            var start = trimmed.IndexOf('{');
            var end = trimmed.LastIndexOf('}');
            if (start >= 0 && end > start) return trimmed[start..(end + 1)];
        }
        return trimmed;
    }

    private async Task<string> ExecuteToolAsync(
        string toolName,
        JsonElement? args,
        AssistantChatCommand request,
        List<AssistantLinkDto> links,
        CancellationToken cancellationToken)
    {
        switch (toolName)
        {
            case "getMyOrders":
            {
                if (string.IsNullOrWhiteSpace(request.UserId))
                    return JsonSerializer.Serialize(new { error = "AUTH_REQUIRED" });

                var status = args?.TryGetProperty("status", out var s) == true ? s.GetString() : null;
                var list = await orders.GetOrdersDtoAsync(request.UserId, cancellationToken);
                if (!string.IsNullOrWhiteSpace(status))
                    list = list.Where(o => string.Equals(o.Status, status, StringComparison.OrdinalIgnoreCase)).ToList();

                return JsonSerializer.Serialize(list.Take(6));
            }
            case "getMyCart":
            {
                if (string.IsNullOrWhiteSpace(request.UserId))
                    return JsonSerializer.Serialize(new { error = "AUTH_REQUIRED" });
                var cart = await carts.GetCartDtoAsync(request.UserId, cancellationToken);
                return JsonSerializer.Serialize(cart);
            }
            case "getMySubscription":
            {
                if (string.IsNullOrWhiteSpace(request.UserId))
                    return JsonSerializer.Serialize(new { error = "AUTH_REQUIRED" });
                var sub = await subs.GetActiveDtoAsync(request.UserId, cancellationToken);
                return JsonSerializer.Serialize(sub);
            }
            case "searchProducts":
            {
                var limit = GetInt(args, "limit") ?? 6;
                var fandom = GetString(args, "fandom");
                var type = GetString(args, "type");
                var min = GetDecimal(args, "minPrice");
                var max = GetDecimal(args, "maxPrice");
                var keyword = GetString(args, "keyword");
                var artist = GetString(args, "artist");

                var list = await products.GetProductsDtoAsync(fandom, type, min, max, true, cancellationToken);

                var filtered = list
                    .Where(p => string.IsNullOrWhiteSpace(keyword)
                                || p.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                                || p.Fandom.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                                || p.Artist.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    .Where(p => string.IsNullOrWhiteSpace(artist)
                                || p.Artist.Contains(artist, StringComparison.OrdinalIgnoreCase))
                    .Take(Math.Clamp(limit, 1, 6))
                    .ToList();

                foreach (var p in filtered)
                    links.Add(new AssistantLinkDto($"{p.Artist} • {p.Name}", $"{request.FrontendBaseUrl}/product/{p.Id}"));

                return JsonSerializer.Serialize(filtered);
            }
            case "searchAuctions":
            {
                var limit = GetInt(args, "limit") ?? 6;
                var fandom = GetString(args, "fandom");
                var keyword = GetString(args, "keyword");
                var artist = GetString(args, "artist");
                var isLive = GetBool(args, "isLive");

                var dto = await auctions.GetAuctionsDtoAsync(fandom, isLive, null, cancellationToken);
                var filtered = dto
                    .Where(a => string.IsNullOrWhiteSpace(keyword)
                                || (a.Name?.Contains(keyword, StringComparison.OrdinalIgnoreCase) ?? false)
                                || (a.Artist?.Contains(keyword, StringComparison.OrdinalIgnoreCase) ?? false)
                                || (a.Fandom?.Contains(keyword, StringComparison.OrdinalIgnoreCase) ?? false))
                    .Where(a => string.IsNullOrWhiteSpace(artist)
                                || (a.Artist?.Contains(artist, StringComparison.OrdinalIgnoreCase) ?? false))
                    .Take(Math.Clamp(limit, 1, 6))
                    .ToList();

                foreach (var a in filtered)
                    links.Add(new AssistantLinkDto($"{a.Artist} • {a.Name}", $"{request.FrontendBaseUrl}/auction/{a.Id}"));

                return JsonSerializer.Serialize(filtered);
            }
            default:
                return JsonSerializer.Serialize(new { error = "UNKNOWN_TOOL" });
        }
    }

    private static string? GetString(JsonElement? args, string name)
        => args?.TryGetProperty(name, out var v) == true && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    private static int? GetInt(JsonElement? args, string name)
        => args?.TryGetProperty(name, out var v) == true && v.TryGetInt32(out var i) ? i : null;

    private static decimal? GetDecimal(JsonElement? args, string name)
        => args?.TryGetProperty(name, out var v) == true && v.TryGetDecimal(out var d) ? d : null;

    private static bool? GetBool(JsonElement? args, string name)
        => args?.TryGetProperty(name, out var v) == true && v.ValueKind is JsonValueKind.True or JsonValueKind.False ? v.GetBoolean() : null;
}
