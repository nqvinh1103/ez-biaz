using EzBias.Application.Features.Products.Models;
using EzBias.Contracts.Features.Products.Dtos;
using MediatR;

namespace EzBias.Application.Features.Products.Commands.CreateListing;

public record CreateListingCommand(string SellerId, CreateListingModel Model) : IRequest<ProductDto>;
