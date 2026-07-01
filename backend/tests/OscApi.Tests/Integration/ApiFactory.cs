using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OscApi.Common;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Tests.Integration;

/// <summary>
/// Boots the real ASP.NET app in-process with an in-memory database, so
/// integration tests exercise the full HTTP + middleware + EF pipeline.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    // Shared root so the seed context and the app's contexts see the same store.
    private static readonly InMemoryDatabaseRoot Root = new();
    private readonly string _dbName = "it-" + Guid.NewGuid();

    public const string AdminEmail = "admin@uia.go.ug";
    public const string AdminPassword = "Admin@2026!";

    static ApiFactory()
    {
        // Program reads configuration (e.g. the connection string) at CreateBuilder
        // time — before the factory's ConfigureAppConfiguration runs under minimal
        // hosting — so these must be present as environment variables up front. The
        // Npgsql string is a syntactically valid placeholder; the actual provider is
        // swapped for InMemory in ConfigureTestServices.
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection",
            "Host=localhost;Database=placeholder;Username=u;Password=p");
        Environment.SetEnvironmentVariable("Jwt__Secret", "integration-test-secret-minimum-32-characters!!");
        Environment.SetEnvironmentVariable("Jwt__ExpiryHours", "24");
        Environment.SetEnvironmentVariable("Jwt__Issuer", "osc-api");
        Environment.SetEnvironmentVariable("Cors__AllowedOrigins", "http://localhost:3000");
        Environment.SetEnvironmentVariable("SiteUrl", "http://localhost:3000");
        Environment.SetEnvironmentVariable("RunMigrationsOnStartup", "false");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // "Testing" env skips the migrate/seed-on-startup block (InMemory can't migrate).
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<OscDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            services.AddDbContext<OscDbContext>(options => options.UseInMemoryDatabase(_dbName, Root));

            // Create schema + seed a known admin so login tests have credentials.
            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            db.Database.EnsureCreated();
            if (!db.AdminUsers.Any(a => a.Email == AdminEmail))
            {
                db.AdminUsers.Add(new AdminUser
                {
                    Name = "OSC Administrator",
                    Email = AdminEmail,
                    PasswordHash = new PasswordService().HashPassword(AdminPassword),
                    Role = "admin",
                    IsActive = true,
                });
                db.SaveChanges();
            }
        });
    }
}
