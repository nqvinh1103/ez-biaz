using EzBias.Application.Common.Interfaces.AI;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Assistant.Dtos;
using MediatR;

namespace EzBias.Application.Features.Assistant.Commands.Chat;

public class AssistantChatCommandHandler(
    IChatModelClient llm,
    IConversationStore store,
    IProductRepository products,
    IAuctionRepository auctions,
    IOrderRepository orders) : IRequestHandler<AssistantChatCommand, AssistantChatResponse>
{
    public async Task<AssistantChatResponse> Handle(AssistantChatCommand request, CancellationToken cancellationToken)
    {
        var (cid, _) = store.GetOrCreate(request.ConversationId);

        // system context (lightweight - can be replaced with RAG later)
        var system = "You are EzBias assistant for a K-pop marketplace. " +
                     "Answer concisely. When user asks for items, suggest up to 6 matching products/auctions with links. " +
                     "Use VND prices. If missing constraints (fandom/artist/budget), ask a short follow-up. " +
                     "Never reveal sensitive data (bank info, tokens).";

        // Tool-like routing (demo)
        var msg = request.Message.Trim();
        var links = new List<AssistantLinkDto>();

        // Personal order questions
        if (LooksLikeOrderQuestion(msg))
        {
            if (string.IsNullOrWhiteSpace(request.UserId))
            {
                return new AssistantChatResponse(cid, "Bạn cần đăng nhập để mình xem đơn hàng của bạn.", links);
            }

            var list = await orders.GetOrdersDtoAsync(request.UserId, cancellationToken);
            if (list.Count == 0)
                return new AssistantChatResponse(cid, "Hiện bạn chưa có đơn hàng nào.", links);

            var top = list.Take(5).ToList();
            var lines = top.Select(o => $"- #{o.Id}: {o.Status} • {o.Total:n0}₫ • {o.CreatedAt}");
            var reply = "Đơn hàng gần đây của bạn:\n" + string.Join("\n", lines);
            return new AssistantChatResponse(cid, reply, links);
        }

        // Auctions search
        if (LooksLikeAuctionQuestion(msg))
        {
            var q = InferKeyword(msg);
            var dto = await auctions.GetAuctionsDtoAsync(null, null, null, cancellationToken);
            var filtered = dto
                .Where(a => string.IsNullOrWhiteSpace(q)
                            || (a.Name?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false)
                            || (a.Artist?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false)
                            || (a.Fandom?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false))
                .Take(6)
                .ToList();

            if (filtered.Count == 0)
                return new AssistantChatResponse(cid, "Hiện mình chưa thấy auction phù hợp. Bạn cho mình fandom/artist hoặc tầm giá nhé.", links);

            foreach (var a in filtered)
            {
                links.Add(new AssistantLinkDto($"Auction: {a.Name}", $"{request.FrontendBaseUrl}/auction/{a.Id}"));
            }

            var reply = "Mình tìm được vài auction phù hợp:\n" + string.Join("\n", filtered.Select(a => $"- {a.Artist} • {a.Name} • bid {a.CurrentBid:n0}₫"));
            return new AssistantChatResponse(cid, reply, links);
        }

        // Products search
        if (LooksLikeProductQuestion(msg))
        {
            var q = InferKeyword(msg);
            var list = await products.GetProductsDtoAsync(
                fandom: null,
                type: null,
                minPrice: null,
                maxPrice: null,
                inStockOnly: true,
                cancellationToken: cancellationToken);
            var filtered = list
                .Where(p => string.IsNullOrWhiteSpace(q)
                            || p.Name.Contains(q, StringComparison.OrdinalIgnoreCase)
                            || p.Artist.Contains(q, StringComparison.OrdinalIgnoreCase)
                            || p.Fandom.Contains(q, StringComparison.OrdinalIgnoreCase))
                .Take(6)
                .ToList();

            if (filtered.Count == 0)
                return new AssistantChatResponse(cid, "Mình chưa thấy sản phẩm phù hợp. Bạn cho mình fandom/artist hoặc tầm giá (ví dụ < 500k) nhé.", links);

            foreach (var p in filtered)
            {
                links.Add(new AssistantLinkDto($"Product: {p.Name}", $"{request.FrontendBaseUrl}/product/{p.Id}"));
            }

            var reply = "Gợi ý sản phẩm cho bạn:\n" + string.Join("\n", filtered.Select(p => $"- {p.Artist} • {p.Name} • {p.Price:n0}₫"));
            return new AssistantChatResponse(cid, reply, links);
        }

        // Fallback: ask Gemini with system + recent context
        var history = store.GetHistory(cid).ToList();
        var prompt = new List<ChatMessage>
        {
            new("user", system)
        };
        prompt.AddRange(history.TakeLast(10));
        prompt.Add(new("user", msg));

        var answer = await llm.GenerateAsync(prompt, cancellationToken);

        store.Append(cid, new ChatMessage("user", msg));
        store.Append(cid, new ChatMessage("model", answer));

        return new AssistantChatResponse(cid, answer, links);
    }

    private static bool LooksLikeOrderQuestion(string msg)
        => msg.Contains("đơn", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("order", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("shipping", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("trạng thái", StringComparison.OrdinalIgnoreCase);

    private static bool LooksLikeAuctionQuestion(string msg)
        => msg.Contains("auction", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("đấu giá", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("bid", StringComparison.OrdinalIgnoreCase);

    private static bool LooksLikeProductQuestion(string msg)
        => msg.Contains("món", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("sản phẩm", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("product", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("fandom", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("nhóm", StringComparison.OrdinalIgnoreCase)
           || msg.Contains("artist", StringComparison.OrdinalIgnoreCase);

    private static string InferKeyword(string msg)
    {
        // very simple heuristic; can be upgraded to structured parsing.
        var tokens = msg.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var stop = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "có","món","đồ","nào","không","của","fandom","nhóm","artist","giá","tầm","dưới","trên","và","auction","đấu","giá"
        };
        var candidate = tokens.FirstOrDefault(t => t.Length >= 3 && !stop.Contains(t));
        return candidate ?? string.Empty;
    }
}
