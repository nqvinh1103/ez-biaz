using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace EzBias.Infrastructure.Data;

public class EzBiasDbContextFactory : IDesignTimeDbContextFactory<EzBiasDbContext>
{
    public EzBiasDbContext CreateDbContext(string[] args)
    {
        // When running from Infrastructure project, go up to EzBias.API to read appsettings.
        var apiPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "EzBias.API");
        if (!Directory.Exists(apiPath)) apiPath = Directory.GetCurrentDirectory();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiPath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var conn = configuration.GetConnectionString("DefaultConnection")
                   ?? "Host=localhost;Port=5432;Database=EzBiasDb;Username=postgres;Password=your_password";

        var optionsBuilder = new DbContextOptionsBuilder<EzBiasDbContext>();
        optionsBuilder.UseNpgsql(conn, x => x.MigrationsAssembly(typeof(EzBiasDbContext).Assembly.FullName));

        return new EzBiasDbContext(optionsBuilder.Options);
    }
}
