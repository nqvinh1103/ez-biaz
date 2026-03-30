using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetSellerAuctions;

public record GetSellerAuctionsQuery(string SellerId, string? Status) : IRequest<IReadOnlyList<AuctionDto>>;
