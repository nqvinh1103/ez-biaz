using EzBias.Application.Features.Orders.Models;
using EzBias.Contracts.Features.Orders.Dtos;
using MediatR;

namespace EzBias.Application.Features.Orders.Commands.Checkout;

public record CheckoutCommand(CheckoutModel Model) : IRequest<OrderDto>;
