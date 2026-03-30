using EzBias.API.Models;
using EzBias.Application.Auth;
using EzBias.Application.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _auth.RegisterAsync(request, ct);
            return Ok(ApiResponse<AuthResponse>.Ok(result, "Account created successfully!"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _auth.LoginAsync(request, ct);
            return Ok(ApiResponse<AuthResponse>.Ok(result, "Login successful."));
        }
        catch (Exception ex)
        {
            return Unauthorized(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _auth.RefreshAsync(request, ct);
            return Ok(ApiResponse<AuthResponse>.Ok(result, "Token refreshed successfully."));
        }
        catch (Exception ex)
        {
            return Unauthorized(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request, CancellationToken ct)
    {
        await _auth.LogoutAsync(request, ct);
        return Ok(ApiResponse<object>.Ok(new { }, "Logged out."));
    }
}
