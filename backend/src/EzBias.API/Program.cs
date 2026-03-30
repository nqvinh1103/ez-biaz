using EzBias.API.Hubs;
using EzBias.API.Realtime;
using EzBias.Application.Common.Interfaces.Realtime;
using EzBias.Application.Common.Interfaces.Repositories;
// (removed) services moved to CQRS handlers
using EzBias.Application.Services.Auth;
using EzBias.Infrastructure.Data;
using EzBias.Infrastructure.Payments;
using EzBias.Infrastructure.Repositories;
using EzBias.Infrastructure.Seeding;
// (removed) Application feature services migrated to MediatR handlers
using EzBias.Infrastructure.Services.Auth;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();

// Background jobs
builder.Services.AddHostedService<EzBias.API.Services.AuctionEndHostedService>();
builder.Services.AddHostedService<EzBias.API.Services.AuctionExpiryHostedService>();

builder.Services.AddHttpClient();

builder.Services.Configure<EzBias.Infrastructure.Payments.VnpaySettings>(
    builder.Configuration.GetSection(EzBias.Infrastructure.Payments.VnpaySettings.SectionName)
);

// MediatR (CQRS)
builder.Services.AddMediatR(typeof(EzBias.Application.Features.Products.Queries.GetProducts.GetProductsQuery).Assembly);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://ez-biaz-frontend.vercel.app/p"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Db
var conn = builder.Configuration.GetConnectionString("DefaultConnection")
           ?? "Host=localhost;Port=5432;Database=EzBiasDb;Username=postgres;Password=your_password";

builder.Services.AddDbContext<EzBiasDbContext>(opt =>
    opt.UseNpgsql(conn, b => b.MigrationsAssembly("EzBias.Infrastructure"))
);

// JWT bearer
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "CHANGE_ME_DEV_SECRET_32CHARS_MIN";
if (jwtSecret.Length < 32) jwtSecret = jwtSecret.PadRight(32, 'x');
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

// DI
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();

// Payments
builder.Services.AddScoped<EzBias.Application.Common.Interfaces.Payments.IVnpayService, VnpayService>();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPayoutRepository, PayoutRepository>();
builder.Services.AddScoped<IEscrowRepository, EscrowRepository>();
builder.Services.AddScoped<IProductBoostRepository, ProductBoostRepository>();
builder.Services.AddScoped<IAuctionRealtimePublisher, SignalRAuctionRealtimePublisher>();

// Assistant (Gemini)
builder.Services.AddHttpClient<EzBias.Application.Common.Interfaces.AI.IChatModelClient, EzBias.Infrastructure.AI.GeminiChatClient>();
builder.Services.AddSingleton<EzBias.Application.Features.Assistant.Commands.Chat.IConversationStore, EzBias.Application.Features.Assistant.Commands.Chat.InMemoryConversationStore>();

// Image storage (Cloudinary)
builder.Services.AddSingleton<EzBias.Application.Common.Interfaces.Storage.IImageStorage>(sp =>
{
    var url = builder.Configuration["CLOUDINARY_URL"];
    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("Missing CLOUDINARY_URL environment variable.");
    return new EzBias.Infrastructure.Services.Images.CloudinaryImageStorage(url);
});

// refresh days from config (optional)
var refreshDays = int.TryParse(builder.Configuration["Jwt:RefreshTokenDays"], out var d) ? d : 7;
builder.Services.AddScoped<IAuthService>(sp =>
{
    var db = sp.GetRequiredService<EzBiasDbContext>();
    var hasher = sp.GetRequiredService<IPasswordHasher>();
    var jwt = sp.GetRequiredService<IJwtTokenService>();
    var refresh = sp.GetRequiredService<IRefreshTokenService>();
    return new EzBias.Infrastructure.Services.Auth.AuthService(db, hasher, jwt, refresh, refreshDays);
});

var app = builder.Build();

// Apply migrations + seed (best-effort)
// - In Development: always migrate + seed.
// - In Production: migrate only. Seed is opt-in via env var SEED_ON_START=true
var seedOnStart = string.Equals(builder.Configuration["SEED_ON_START"], "true", StringComparison.OrdinalIgnoreCase);

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<EzBiasDbContext>();
    await db.Database.MigrateAsync();

    if (app.Environment.IsDevelopment() || seedOnStart)
        await DataSeeder.SeedAsync(scope.ServiceProvider);
}
catch (Exception ex)
{
    // Log to stdout so Render logs show migration/seed failures
    Console.WriteLine("[Startup] Migration/seed failed: " + ex);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<AuctionHub>("/hubs/auctions");

app.Run();
