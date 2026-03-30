using EzBias.Application.Features.Products.Models;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Commands.UpdateListing;

public record UpdateListingCommand(string SellerId, string ProductId, UpdateListingModel Model) : IRequest<ProductDto?>;
