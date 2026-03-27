using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Queries.GetProductById;

public class GetProductByIdQueryHandler(IProductRepository repo) : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    public Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        => repo.GetByIdDtoAsync(request.Id, cancellationToken);
}
