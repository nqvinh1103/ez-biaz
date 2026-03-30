using Microsoft.AspNetCore.SignalR;

namespace EzBias.API.Hubs;

public class AuctionHub : Hub
{
    public Task JoinAuction(string auctionId)
        => Groups.AddToGroupAsync(Context.ConnectionId, Group(auctionId));

    public Task LeaveAuction(string auctionId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, Group(auctionId));

    public static string Group(string auctionId) => $"auction:{auctionId}";
}
