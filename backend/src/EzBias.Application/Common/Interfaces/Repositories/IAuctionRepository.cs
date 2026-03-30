using EzBias.Contracts.Features.Auctions.Dtos;
using EzBias.Domain.Entities;

namespace EzBias.Application.Common.Interfaces.Repositories;

public interface IAuctionRepository
{
    // READ (query): projection to DTO
    Task<IReadOnlyList<AuctionDto>> GetAuctionsDtoAsync(string? fandom, bool? isLive, bool? isUrgent, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuctionDto>> GetSellerAuctionsDtoAsync(string sellerId, string? status, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuctionDto>> GetMyWonAuctionsDtoAsync(string userId, bool pendingPaymentOnly, CancellationToken cancellationToken = default);

    Task<AuctionDetailDto?> GetAuctionDetailDtoAsync(string id, CancellationToken cancellationToken = default);

    // (removed) entity-returning query methods; use *DtoAsync for reads

    // tracked for bidding
    Task<Auction?> GetAuctionForBiddingAsync(string id, CancellationToken cancellationToken = default);

    // CREATE
    Task<string> NextAuctionIdAsync(CancellationToken cancellationToken = default);
    Task AddAuctionAsync(Auction auction, CancellationToken cancellationToken = default);
    Task<bool> AnyLiveAuctionForProductAsync(string productId, CancellationToken cancellationToken = default);

    Task<string> NextBidIdAsync(CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
