using EzBias.API.Models;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Domain.Entities.Payments;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PayoutsController(IPayoutRepository payouts) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Payout>>>> GetPending()
    {
        var list = await payouts.GetPendingAsync();
        return ApiResponse<IReadOnlyList<Payout>>.Ok(list);
    }

    public record MarkPaidRequest(string BankTransferRef);

    [HttpPost("{payoutId}/mark-paid")]
    public async Task<ActionResult<ApiResponse<object>>> MarkPaid([FromRoute] string payoutId, [FromBody] MarkPaidRequest req)
    {
        try
        {
            await payouts.MarkPaidAsync(payoutId, req.BankTransferRef);
            await payouts.SaveChangesAsync();
            return ApiResponse<object>.Ok(new { payoutId }, "Payout marked as paid.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpGet("seller/{sellerId}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Payout>>>> GetSellerPayouts([FromRoute] string sellerId)
    {
        var list = await payouts.GetBySellerIdAsync(sellerId);
        return ApiResponse<IReadOnlyList<Payout>>.Ok(list);
    }
}
