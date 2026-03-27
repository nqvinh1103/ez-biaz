using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetAuctions;

public class GetAuctionsQueryHandler(IAuctionRepository repo) : IRequestHandler<GetAuctionsQuery, IReadOnlyList<AuctionDto>>
{
    public Task<IReadOnlyList<AuctionDto>> Handle(GetAuctionsQuery request, CancellationToken cancellationToken)
        => repo.GetAuctionsDtoAsync(request.Fandom, request.LiveOnly, request.UrgentOnly, cancellationToken);
}
