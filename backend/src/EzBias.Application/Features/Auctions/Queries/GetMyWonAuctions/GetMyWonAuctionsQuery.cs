using EzBias.Contracts.Features.Auctions.Dtos;
using MediatR;

namespace EzBias.Application.Features.Auctions.Queries.GetMyWonAuctions;

public record GetMyWonAuctionsQuery(string UserId, bool PendingPaymentOnly) : IRequest<IReadOnlyList<AuctionDto>>;
