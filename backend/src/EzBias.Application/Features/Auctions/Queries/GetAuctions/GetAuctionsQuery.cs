using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetAuctions;

public record GetAuctionsQuery(
    string? Fandom,
    bool? LiveOnly,
    bool? UrgentOnly
) : IRequest<IReadOnlyList<AuctionDto>>;
