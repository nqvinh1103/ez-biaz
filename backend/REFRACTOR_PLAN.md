# EzBias Backend Refactor Plan (Controller -> Service -> Repo)

Goal: move current thin-controller + direct-DbContext endpoints into a clean layering:

- **API**: controllers only (HTTP concerns, DTOs, status codes)
- **Application**: use-cases/services (business rules)
- **Infrastructure**: repositories (EF Core) + implementations
- **Domain**: entities + domain rules

## Current state
Several controllers call `EzBiasDbContext` directly:
- ProductsController (products + listings CRUD)
- AuctionsController (list + detail + bids)
- CartController (cart + guest cart user auto-create)
- OrdersController (checkout + orders)
- ContactController

## Target structure
```
backend/src/
  EzBias.API/
    Controllers/
    Models/Dtos/
  EzBias.Application/
    Common/Interfaces/
      Repositories/
      Services/
    Products/
    Auctions/
    Cart/
    Orders/
    Contact/
  EzBias.Infrastructure/
    Repositories/
    Services/
```

## Step-by-step (safe refactor)
### Phase 1: introduce interfaces + services (no behavior changes)
1. Create repository interfaces in `EzBias.Application/Common/Interfaces/Repositories`:
   - `IProductRepository`
   - `IAuctionRepository`
   - `ICartRepository`
   - `IOrderRepository`
   - `IContactRepository`
   - `IUserRepository` (needed for guest-user creation)

2. Create service interfaces in `EzBias.Application/Common/Interfaces/Services`:
   - `IProductService` (filters, listing CRUD)
   - `IAuctionService` (filters, detail, place bid)
   - `ICartService` (get/add/update/remove/clear, guest behavior)
   - `IOrderService` (checkout, get orders)
   - `IContactService` (send message)

3. Implement repos in `EzBias.Infrastructure/Repositories` using EF Core.

4. Implement services in `EzBias.Infrastructure/Services` (or `EzBias.Application/.../Services` if you prefer pure application layer with DI).

5. Update DI registration in `EzBias.API/Program.cs`.

6. Update controllers to call services only.

### Phase 2: move mapping + validation
- Move mapping to DTOs either:
  - in services (return DTOs), or
  - return domain models + map in controllers.
Recommended for now: **service returns DTOs** to keep controller thin.

- Centralize validation:
  - basic required field validation can stay in controller
  - business rules move into services

### Phase 3: optional improvements
- Add cancellation tokens everywhere
- Add pagination/sorting for products/auctions
- Add auth guards + user identity from JWT instead of passing userId
- Replace guest-user auto-create with a dedicated Guest entity or make CartItem not require User FK

## First slice to refactor (recommended order)
1) Contact (smallest)
2) Products (query + listing CRUD)
3) Auctions
4) Cart (includes guest merge)
5) Orders/Checkout

## Notes
- Keep endpoints + response shape unchanged during refactor.
- Add small integration tests (or Postman collection) once stable.
