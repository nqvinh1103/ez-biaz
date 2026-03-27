# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first for better layer caching
COPY EzBias.API/EzBias.API.csproj EzBias.API/
COPY EzBias.Application/EzBias.Application.csproj EzBias.Application/
COPY EzBias.Infrastructure/EzBias.Infrastructure.csproj EzBias.Infrastructure/
COPY EzBias.Domain/EzBias.Domain.csproj EzBias.Domain/
COPY EzBias.Contracts/EzBias.Contracts.csproj EzBias.Contracts/

RUN dotnet restore EzBias.API/EzBias.API.csproj

# Copy the remaining source
COPY . .

RUN dotnet publish EzBias.API/EzBias.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render provides PORT env var; default to 8080 for local container runs.
EXPOSE 8080
CMD ["sh", "-c", "dotnet EzBias.API.dll --urls http://0.0.0.0:${PORT:-8080}"]
