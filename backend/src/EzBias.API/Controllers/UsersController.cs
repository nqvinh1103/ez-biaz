using EzBias.API.Models;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserRepository users) : ControllerBase
{
    [Authorize]
    [HttpPut("me/bank")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateMyBank([FromBody] UpdateBankInfoRequest req)
    {
        var userId = GetUserId();

        var u = await users.GetTrackedByIdAsync(userId);
        if (u is null) return NotFound(ApiResponse<object>.Fail("User not found."));

        u.BankName = req.BankName?.Trim() ?? string.Empty;
        u.BankAccountNumber = req.BankAccountNumber?.Trim() ?? string.Empty;
        u.BankAccountName = req.BankAccountName?.Trim() ?? string.Empty;
        u.UpdatedAt = DateTime.UtcNow;

        await users.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { userId }, "Bank info updated.");
    }

    private string GetUserId()
    {
        var id =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(id))
            throw new UnauthorizedAccessException("Missing user id.");

        return id;
    }
}
