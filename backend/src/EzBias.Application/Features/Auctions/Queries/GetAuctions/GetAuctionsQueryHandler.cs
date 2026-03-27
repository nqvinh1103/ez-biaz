using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetAuctions;

public class GetAuctionsQueryHandler(IAuctionRepository repo) : IRequestHandler<GetAuctionsQuery, IReadOnlyList<AuctionDto>>
{
    public async Task<IReadOnlyList<AuctionDto>> Handle(GetAuctionsQuery request, CancellationToken cancellationToken)
    {
        // keep same filtering behavior as service/repo currently does
        var list = await repo.GetAuctionsAsync(request.Fandom, request.LiveOnly, request.UrgentOnly, cancellationToken);

        return list.Select(a => new AuctionDto(
            a.Id,
            a.Fandom,
            a.Artist,
            a.Name,
            a.Description,
            a.FloorPrice,
            a.CurrentBid,
            a.SellerId,
            a.EndsAt,
            a.Image,
            a.IsUrgent,
            a.IsLive,
            a.ContainImage
        )).ToList();
    }
}
