using EzBias.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EzBias.API.Services;

/// <summary>
/// Background worker: automatically ends live auctions when EndsAt is reached.
/// - If no bids: ended_no_winner and restore reserved stock (quantity = 1)
/// - If has bids: ended_pending_payment and set winner/finalPrice
/// </summary>
public class AuctionEndHostedService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

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
                Console.WriteLine("[AuctionEnd] Error: " + ex);
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

        var due = await db.Auctions
            .Include(a => a.Bids)
            .Include(a => a.Product)
            .Where(a => a.IsLive && a.EndsAt <= now)
            .ToListAsync(ct);

        if (due.Count == 0) return;

        foreach (var a in due)
        {
            // Idempotent guard
            if (!a.IsLive) continue;

            a.IsLive = false;
            a.EndedAt = now;
            a.UpdatedAt = now;

            var winningBid = a.Bids
                .OrderByDescending(b => b.Amount)
                .ThenBy(b => b.PlacedAt)
                .FirstOrDefault();

            if (winningBid is null)
            {
                a.Status = "ended_no_winner";
                a.WinnerId = null;
                a.FinalPrice = null;

                if (a.Product is not null)
                {
                    a.Product.Stock += 1;
                    a.Product.IsAuction = false;
                    a.Product.UpdatedAt = now;
                }

                continue;
            }

            foreach (var b in a.Bids)
                b.IsWinning = b.Id == winningBid.Id;

            a.Status = "ended_pending_payment";
            a.WinnerId = winningBid.UserId;
            a.FinalPrice = winningBid.Amount;
        }

        await db.SaveChangesAsync(ct);
        Console.WriteLine($"[AuctionEnd] Ended {due.Count} auction(s).");
    }
}
