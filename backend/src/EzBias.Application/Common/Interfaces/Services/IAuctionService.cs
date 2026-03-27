using EzBias.Contracts.Features.Auctions.Dtos;

namespace EzBias.Application.Common.Interfaces.Services;

public interface IAuctionService
{
    Task<IReadOnlyList<AuctionDto>> GetAuctionsAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default);

    Task<AuctionDetailDto?> GetAuctionDetailAsync(string id, CancellationToken cancellationToken = default);

    Task<BidDto> PlaceBidAsync(string auctionId, string userId, decimal amount, CancellationToken cancellationToken = default);
}
