using MediatR;

namespace EzBias.Application.Features.Products.Commands.DeleteListing;

public record DeleteListingCommand(string SellerId, string ProductId) : IRequest<bool>;
