using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Services;

public interface IAuctionService
{
    Task<IReadOnlyList<Auction>> GetAuctionsAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default);

    Task<Auction?> GetAuctionDetailAsync(string id, CancellationToken cancellationToken = default);

    Task<Bid> PlaceBidAsync(string auctionId, string userId, decimal amount, CancellationToken cancellationToken = default);
}
