using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.RelistAuction;

public record RelistAuctionCommand(
    string AuctionId,
    string SellerId,
    int? DurationHours,
    int? DurationSeconds,
    bool IsUrgent
) : IRequest<string>; // new auction id
