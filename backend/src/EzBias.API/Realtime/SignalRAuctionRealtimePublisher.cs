using EzBias.API.Hubs;
using EzBias.Application.Common.Interfaces.Realtime;
using EzBias.Contracts.Features.Auctions.Dtos;
using Microsoft.AspNetCore.SignalR;

namespace EzBias.API.Realtime;

public class SignalRAuctionRealtimePublisher(IHubContext<AuctionHub> hub) : IAuctionRealtimePublisher
{
    public Task PublishBidPlacedAsync(string auctionId, decimal currentBid, DateTime endsAt, BidDto bid, CancellationToken cancellationToken = default)
        => hub.Clients.Group(AuctionHub.Group(auctionId)).SendAsync("bid_placed", new
        {
            auctionId,
            currentBid,
            endsAt,
            bid
        }, cancellationToken);

    public Task PublishAuctionExtendedAsync(string auctionId, DateTime endsAt, CancellationToken cancellationToken = default)
        => hub.Clients.Group(AuctionHub.Group(auctionId)).SendAsync("auction_extended", new
        {
            auctionId,
            endsAt
        }, cancellationToken);
}
