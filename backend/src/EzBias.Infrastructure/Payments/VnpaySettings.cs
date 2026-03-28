namespace EzBias.Infrastructure.Payments;

public class VnpaySettings
{
    public const string SectionName = "Vnpay";

    public string TmnCode { get; set; } = string.Empty;
    public string HashSecret { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    public string ReturnUrl { get; set; } = string.Empty;
    public string IpnUrl { get; set; } = string.Empty;

    public string Version { get; set; } = "2.1.0";
}
