namespace EzBias.Domain.Entities.Payments;

public class PaymentOrder
{
    public string PaymentId { get; set; } = default!;
    public Payment? Payment { get; set; }

    public string OrderId { get; set; } = default!;
}
