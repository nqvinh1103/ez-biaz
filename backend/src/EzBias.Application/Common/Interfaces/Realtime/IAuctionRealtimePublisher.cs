namespace EzBias.Application.Common.Interfaces.Realtime;

using EzBias.Contracts.Features.Auctions.Dtos;

public interface IAuctionRealtimePublisher
{
    Task PublishBidPlacedAsync(string auctionId, decimal currentBid, DateTime endsAt, BidDto bid, CancellationToken cancellationToken = default);
    Task PublishAuctionExtendedAsync(string auctionId, DateTime endsAt, CancellationToken cancellationToken = default);
}
