using EzBias.Application.Common.Interfaces.Payments;
using EzBias.Contracts.Features.Payments.Dtos;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace EzBias.Infrastructure.Payments;

public class VnpayService(IOptions<VnpaySettings> options) : IVnpayService
{
    private readonly VnpaySettings _settings = options.Value;

    public string CreatePaymentUrl(VnpayCreateRequest request)
    {
        // VNPay amount is VND * 100
        var amountX100 = request.AmountVnd * 100;

        var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = _settings.Version,
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _settings.TmnCode,
            ["vnp_Amount"] = amountX100.ToString(CultureInfo.InvariantCulture),
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = request.TxnRef,
            ["vnp_OrderInfo"] = request.OrderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _settings.ReturnUrl,
            // NOTE: Many VNPay setups require IPN URL to be configured in the merchant portal,
            // not passed as vnp_IpnUrl in the payment URL. Passing it can trigger checksum issues.
            //["vnp_IpnUrl"] = _settings.IpnUrl,
            ["vnp_IpAddr"] = request.IpAddress,
            ["vnp_CreateDate"] = request.CreateDateUtc.ToString("yyyyMMddHHmmss")
        };

        // IMPORTANT: VNPay computes HMAC over URL-encoded key/value pairs (same format as query string)
        var hashData = BuildQuery(vnpParams);
        var secureHash = HmacSha512((_settings.HashSecret ?? string.Empty).Trim(), hashData);

        var query = hashData
                    + "&vnp_SecureHashType=HMACSHA512"
                    + "&vnp_SecureHash=" + WebUtility.UrlEncode(secureHash);
        return _settings.BaseUrl + "?" + query;
    }

    public bool ValidateCallback(IReadOnlyDictionary<string, string?> query)
    {
        if (!query.TryGetValue("vnp_SecureHash", out var provided) || string.IsNullOrWhiteSpace(provided))
            return false;

        var vnp = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var kv in query)
        {
            if (kv.Key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(kv.Key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(kv.Key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase)
                && kv.Value is not null)
            {
                vnp[kv.Key] = kv.Value;
            }
        }

        var hashData = BuildQuery(vnp);
        var expected = HmacSha512((_settings.HashSecret ?? string.Empty).Trim(), hashData);
        return string.Equals(expected, provided, StringComparison.OrdinalIgnoreCase);
    }

    private static string BuildQuery(SortedDictionary<string, string> data)
    {
        var sb = new StringBuilder();
        foreach (var (k, v) in data)
        {
            if (sb.Length > 0) sb.Append('&');
            sb.Append(WebUtility.UrlEncode(k));
            sb.Append('=');
            sb.Append(WebUtility.UrlEncode(v));
        }
        return sb.ToString();
    }

    private static string HmacSha512(string key, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        using var hmac = new HMACSHA512(keyBytes);
        var hash = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
