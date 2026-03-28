using EzBias.API.Models;
using EzBias.Application.Features.Subscriptions.Commands.CancelSubscription;
using EzBias.Application.Features.Subscriptions.Commands.Subscribe;
using EzBias.Application.Features.Subscriptions.Queries.GetMySubscription;
using EzBias.Contracts.Features.Subscriptions.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController(IMediator mediator) : ControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<SubscriptionDto?>>> GetMine()
    {
        var userId = GetUserId();
        var dto = await mediator.Send(new GetMySubscriptionQuery(userId));
        return ApiResponse<SubscriptionDto?>.Ok(dto);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<SubscriptionDto>>> Subscribe([FromBody] SubscribeRequest req)
    {
        try
        {
            var userId = GetUserId();
            var dto = await mediator.Send(new SubscribeCommand(userId, req.PlanId));
            return ApiResponse<SubscriptionDto>.Ok(dto, "Subscription activated.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<SubscriptionDto>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("me")]
    public async Task<ActionResult<ApiResponse<SubscriptionDto?>>> Cancel()
    {
        var userId = GetUserId();
        var dto = await mediator.Send(new CancelSubscriptionCommand(userId));
        return ApiResponse<SubscriptionDto?>.Ok(dto, dto is null ? "No active subscription." : "Subscription canceled.");
    }

    private string GetUserId()
    {
        // Our JWT uses standard "sub" claim for user id.
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrWhiteSpace(sub))
            throw new UnauthorizedAccessException("Missing user id.");
        return sub;
    }
}
