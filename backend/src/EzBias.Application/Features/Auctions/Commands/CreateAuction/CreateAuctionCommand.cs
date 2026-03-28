using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Commands.CreateAuction;

public record CreateAuctionCommand(string SellerId, string ProductId, int DurationHours, bool IsUrgent) : IRequest<AuctionDetailDto>;
