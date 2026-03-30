using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Services;

/// <summary>
/// Background worker: after 1 hour from EndedAt, if still ended_pending_payment,
/// mark winner_failed and restore reserved stock (quantity = 1).
/// </summary>
public class AuctionExpiryHostedService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);
    private static readonly TimeSpan WinnerPaymentWindow = TimeSpan.FromMinutes(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine("[AuctionExpiry] Error: " + ex);
            }

            try
            {
                await Task.Delay(PollInterval, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                // ignore
            }
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EzBiasDbContext>();

        var now = DateTime.UtcNow;
        var deadline = now - WinnerPaymentWindow;

        var expired = await db.Auctions
            .Include(a => a.Product)
            .Where(a => !a.IsLive
                        && a.Status == "ended_pending_payment"
                        && a.EndedAt != null
                        && a.EndedAt < deadline)
            .ToListAsync(ct);

        if (expired.Count == 0) return;

        foreach (var a in expired)
        {
            a.Status = "winner_failed";
            a.UpdatedAt = now;

            if (a.Product is not null)
            {
                a.Product.Stock += 1;
                a.Product.IsAuction = false;
                a.Product.UpdatedAt = now;
            }
        }

        await db.SaveChangesAsync(ct);
        Console.WriteLine($"[AuctionExpiry] Marked {expired.Count} auction(s) as winner_failed.");
    }
}
