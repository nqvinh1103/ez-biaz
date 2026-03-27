using EzBias.Contracts.Features.Auctions.Dtos;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IAuctionRepository
{
    // READ (query): projection to DTO
    Task<IReadOnlyList<AuctionDto>> GetAuctionsDtoAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default);

    Task<AuctionDetailDto?> GetAuctionDetailDtoAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Auction>> GetAuctionsAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default);

    Task<Auction?> GetAuctionDetailAsync(string id, CancellationToken cancellationToken = default);

    // tracked for bidding
    Task<Auction?> GetAuctionForBiddingAsync(string id, CancellationToken cancellationToken = default);

    Task<string> NextBidIdAsync(CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
