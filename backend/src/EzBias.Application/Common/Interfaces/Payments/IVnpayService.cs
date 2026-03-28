using EzBias.Contracts.Features.Payments.Dtos;

namespace EzBias.Application.Common.Interfaces.Payments;

public interface IVnpayService
{
    string CreatePaymentUrl(VnpayCreateRequest request);
    bool ValidateCallback(IReadOnlyDictionary<string, string?> query);
}
