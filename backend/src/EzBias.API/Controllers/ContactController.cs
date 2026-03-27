using EzBias.API.Models;
using EzBias.API.Models.Dtos;
using EzBias.Domain.Entities;
using EzBias.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController(EzBiasDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<object?>>> Send([FromBody] ContactRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Message))
            return BadRequest(ApiResponse<object?>.Fail("All fields are required."));

        var emailOk = System.Text.RegularExpressions.Regex.IsMatch(req.Email.Trim(), @"^[^\s@]+@[^\s@]+\.[^\s@]+$");
        if (!emailOk)
            return BadRequest(ApiResponse<object?>.Fail("Please enter a valid email address."));

        var nextId = await NextIdAsync("c", db.ContactMessages.Select(x => x.Id));

        db.ContactMessages.Add(new ContactMessage
        {
            Id = nextId,
            Name = req.Name.Trim(),
            Email = req.Email.Trim(),
            Message = req.Message.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        });

        await db.SaveChangesAsync();

        return ApiResponse<object?>.Ok(null, "Message sent! We'll get back to you within 24 hours.");
    }

    private static async Task<string> NextIdAsync(string prefix, IQueryable<string> ids)
    {
        var list = await ids.ToListAsync();
        var max = 0;
        foreach (var id in list)
        {
            if (!id.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                continue;
            var suffix = id[prefix.Length..];
            if (int.TryParse(suffix, out var n) && n > max)
                max = n;
        }
        return prefix + (max + 1);
    }
}
