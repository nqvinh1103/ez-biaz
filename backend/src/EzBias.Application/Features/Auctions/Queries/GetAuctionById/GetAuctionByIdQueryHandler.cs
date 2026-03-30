using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetAuctionById;

public class GetAuctionByIdQueryHandler(IAuctionRepository repo) : IRequestHandler<GetAuctionByIdQuery, AuctionDetailDto?>
{
    public Task<AuctionDetailDto?> Handle(GetAuctionByIdQuery request, CancellationToken cancellationToken)
        => repo.GetAuctionDetailDtoAsync(request.AuctionId, cancellationToken);
}
