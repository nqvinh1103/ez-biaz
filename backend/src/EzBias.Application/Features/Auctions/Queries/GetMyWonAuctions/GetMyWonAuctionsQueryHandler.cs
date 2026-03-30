using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetMyWonAuctions;

public class GetMyWonAuctionsQueryHandler(IAuctionRepository repo)
    : IRequestHandler<GetMyWonAuctionsQuery, IReadOnlyList<AuctionDto>>
{
    public Task<IReadOnlyList<AuctionDto>> Handle(GetMyWonAuctionsQuery request, CancellationToken cancellationToken)
        => repo.GetMyWonAuctionsDtoAsync(request.UserId, request.PendingPaymentOnly, cancellationToken);
}
