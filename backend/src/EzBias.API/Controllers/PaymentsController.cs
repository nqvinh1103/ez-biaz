using EzBias.API.Models;
using EzBias.Application.Features.Payments.Commands.CreateVnpayAuctionPayment;
using EzBias.Application.Features.Payments.Commands.CreateVnpayOrderPayment;
using EzBias.Application.Features.Payments.Commands.CreateVnpayProductBoostPayment;
using EzBias.Application.Features.Payments.Commands.CreateVnpaySubscriptionPayment;
using EzBias.Application.Features.Payments.Commands.HandleVnpayCallback;
using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Payments.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EzBias.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController(IMediator mediator, IPaymentRepository payments) : ControllerBase
{
    [Authorize]
    [HttpPost("vnpay/orders/create")]
    public async Task<ActionResult<ApiResponse<PaymentRedirectResult>>> CreateVnpayOrderPayment([FromBody] CreateVnpayOrderPaymentRequest req)
    {
        try
        {
            var userId = GetUserId();
            var checkout = req.Checkout with { UserId = userId };
            var ip = GetClientIp();

            var res = await mediator.Send(new CreateVnpayOrderPaymentCommand(new CreateVnpayOrderPaymentRequest(checkout), ip));
            return ApiResponse<PaymentRedirectResult>.Ok(res);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<PaymentRedirectResult>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("vnpay/subscriptions/create")]
    public async Task<ActionResult<ApiResponse<PaymentRedirectResult>>> CreateVnpaySubscriptionPayment([FromBody] CreateVnpaySubscriptionPaymentRequest req)
    {
        try
        {
            var userId = GetUserId();
            var ip = GetClientIp();

            var res = await mediator.Send(new CreateVnpaySubscriptionPaymentCommand(userId, req, ip));
            return ApiResponse<PaymentRedirectResult>.Ok(res);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<PaymentRedirectResult>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("vnpay/auctions/create")]
    public async Task<ActionResult<ApiResponse<PaymentRedirectResult>>> CreateVnpayAuctionPayment([FromBody] CreateVnpayAuctionPaymentRequest req)
    {
        try
        {
            var userId = GetUserId();
            var ip = GetClientIp();

            var res = await mediator.Send(new CreateVnpayAuctionPaymentCommand(userId, req, ip));
            return ApiResponse<PaymentRedirectResult>.Ok(res);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<PaymentRedirectResult>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("vnpay/boosts/create")]
    public async Task<ActionResult<ApiResponse<PaymentRedirectResult>>> CreateVnpayProductBoostPayment([FromBody] CreateVnpayProductBoostPaymentRequest req)
    {
        try
        {
            var userId = GetUserId();
            var ip = GetClientIp();

            var res = await mediator.Send(new CreateVnpayProductBoostPaymentCommand(userId, req, ip));
            return ApiResponse<PaymentRedirectResult>.Ok(res);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<PaymentRedirectResult>.Fail(ex.Message));
        }
    }

    // Return URL: browser redirect fallback.
    [HttpGet("vnpay-return")]
    public async Task<IActionResult> VnpayReturn()
    {
        string? paymentType = null;
        try
        {
            var dict = Request.Query.ToDictionary(k => k.Key, v => (string?)v.Value);

            if (dict.TryGetValue("vnp_TxnRef", out var txnRef) && !string.IsNullOrWhiteSpace(txnRef))
            {
                var payment = await payments.GetByIdAsync(txnRef!, HttpContext.RequestAborted);
                paymentType = payment?.Type;
            }

            await mediator.Send(new HandleVnpayCallbackCommand(dict));
        }
        catch
        {
            // ignore
        }

        var code = Request.Query["vnp_ResponseCode"].ToString();
        var status = string.Equals(code, "00", StringComparison.OrdinalIgnoreCase) ? "success" : "failed";

        var modalType = paymentType switch
        {
            "order" => "checkout",
            "subscription" => "subscription",
            "auction" => "auction",
            "product_boost" => "boost",
            _ => "checkout"
        };

        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        query["payment"] = status;
        query["code"] = code;
        query["type"] = modalType;

        // Keep useful VNPay fields for modal details.
        foreach (var key in new[] { "vnp_Amount", "vnp_TransactionNo", "vnp_BankCode", "vnp_PayDate", "vnp_TxnRef" })
        {
            var val = Request.Query[key].ToString();
            if (!string.IsNullOrWhiteSpace(val)) query[key] = val;
        }

        var redirect = $"http://localhost:5173/?{query}";
        return Redirect(redirect);
    }

    // IPN URL: server-to-server (VNPay uses GET query).
    [HttpGet("vnpay-ipn")]
    public async Task<IActionResult> VnpayIpn()
    {
        try
        {
            var dict = Request.Query.ToDictionary(k => k.Key, v => (string?)v.Value);
            await mediator.Send(new HandleVnpayCallbackCommand(dict));
            // VNPay expects some response format; for demo keep 200 OK.
            return Ok(new { RspCode = "00", Message = "Confirm Success" });
        }
        catch (ArgumentException)
        {
            return Ok(new { RspCode = "97", Message = "Invalid Signature" });
        }
        catch (Exception ex)
        {
            return Ok(new { RspCode = "99", Message = ex.Message });
        }
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

    private string GetClientIp()
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        // VNPay sandbox can be picky; prefer IPv4 format in local dev.
        if (ip.Contains(':')) ip = "127.0.0.1";
        return ip;
    }
}
