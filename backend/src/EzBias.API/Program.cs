using EzBias.Application.Common.Interfaces.Repositories;
using EzBias.Application.Common.Interfaces.Services;
using EzBias.Application.Services.Auth;
using EzBias.Infrastructure.Data;
using EzBias.Infrastructure.Repositories;
using EzBias.Infrastructure.Seeding;
using EzBias.Infrastructure.Services;
using EzBias.Infrastructure.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Db
var conn = builder.Configuration.GetConnectionString("DefaultConnection")
           ?? "Host=localhost;Port=5432;Database=EzBiasDb;Username=postgres;Password=your_password";

builder.Services.AddDbContext<EzBiasDbContext>(opt => opt.UseNpgsql(conn));

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

// Contact layering
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IContactService, ContactService>();

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
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EzBiasDbContext>();
        await db.Database.MigrateAsync();
        await DataSeeder.SeedAsync(scope.ServiceProvider);
    }
    catch
    {
        // ignore on dev if db is not reachable (e.g., Docker not running)
    }

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
