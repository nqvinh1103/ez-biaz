using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetSellerAuctions;

public class GetSellerAuctionsQueryHandler(IAuctionRepository repo)
    : IRequestHandler<GetSellerAuctionsQuery, IReadOnlyList<AuctionDto>>
{
    public Task<IReadOnlyList<AuctionDto>> Handle(GetSellerAuctionsQuery request, CancellationToken cancellationToken)
        => repo.GetSellerAuctionsDtoAsync(request.SellerId, request.Status, cancellationToken);
}
