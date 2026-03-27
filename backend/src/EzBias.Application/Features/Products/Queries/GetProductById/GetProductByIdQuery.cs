using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetProductById;

public record GetProductByIdQuery(string Id) : IRequest<ProductDto?>;
