using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetAuctionById;

public class GetAuctionByIdQueryHandler(IAuctionRepository repo) : IRequestHandler<GetAuctionByIdQuery, AuctionDetailDto?>
{
    public async Task<AuctionDetailDto?> Handle(GetAuctionByIdQuery request, CancellationToken cancellationToken)
    {
        var a = await repo.GetAuctionDetailAsync(request.AuctionId, cancellationToken);
        if (a is null) return null;

        var bids = a.Bids
            .OrderByDescending(b => b.Amount)
            .Select(b => new BidDto(
                b.Id,
                b.AuctionId,
                b.UserId,
                b.Username,
                b.Avatar,
                b.AvatarBg,
                b.Amount,
                b.PlacedAt,
                b.IsWinning
            ))
            .ToList();

        return new AuctionDetailDto(
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
            a.ContainImage,
            bids
        );
    }
}
