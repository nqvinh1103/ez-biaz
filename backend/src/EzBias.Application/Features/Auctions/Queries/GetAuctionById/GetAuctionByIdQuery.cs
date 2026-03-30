using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetAuctionById;

public record GetAuctionByIdQuery(string AuctionId) : IRequest<AuctionDetailDto?>;
