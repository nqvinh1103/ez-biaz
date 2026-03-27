using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.PlaceBid;

public record PlaceBidCommand(string AuctionId, string UserId, decimal Amount) : IRequest<BidDto>;
