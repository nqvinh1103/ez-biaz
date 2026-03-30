using EzBias.API.Models;
using EzBias.Application.Features.Contact.Commands.SendContactMessage;
using EzBias.Contracts.Features.Contact.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<object?>>> Send([FromBody] ContactRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Message))
            return BadRequest(ApiResponse<object?>.Fail("All fields are required."));

        var emailOk = System.Text.RegularExpressions.Regex.IsMatch(req.Email.Trim(), @"^[^\s@]+@[^\s@]+\.[^\s@]+$");
        if (!emailOk)
            return BadRequest(ApiResponse<object?>.Fail("Please enter a valid email address."));

        await mediator.Send(new SendContactMessageCommand(req.Name, req.Email, req.Message));

        return ApiResponse<object?>.Ok(null, "Message sent! We'll get back to you within 24 hours.");
    }
}
