using Microsoft.EntityFrameworkCore;
using OscApi.Data;

namespace OscApi.Tests.Helpers;

public static class TestDbFactory
{
    public static OscDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<OscDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        var db = new OscDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }
}
