using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.EndAuction;

public record EndAuctionCommand(string AuctionId, string SellerId) : IRequest<bool>;
