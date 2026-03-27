using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetSellerListings;

public record GetSellerListingsQuery(string SellerId) : IRequest<IReadOnlyList<ProductDto>>;
