using EzBias.API.Models;
using EzBias.Application.Features.Assistant.Commands.Chat;
using EzBias.Contracts.Features.Assistant.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssistantController(IMediator mediator, IConfiguration config) : ControllerBase
{
    [HttpPost("chat")]
    public async Task<ActionResult<ApiResponse<AssistantChatResponse>>> Chat([FromBody] AssistantChatRequest req)
    {
        var userId = TryGetUserId();
        var feBase = config["Frontend:BaseUrl"] ?? "http://localhost:5173";

        var res = await mediator.Send(new AssistantChatCommand(
            req.Message,
            req.ConversationId,
            userId,
            feBase
        ));

        return ApiResponse<AssistantChatResponse>.Ok(res);
    }

    private string? TryGetUserId()
    {
        if (User?.Identity?.IsAuthenticated != true) return null;
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub");
    }
}
