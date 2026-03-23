using Microsoft.AspNetCore.Mvc;
using OscApi.Data;
using OscApi.Dtos.Common;

namespace OscApi.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly OscDbContext _db;

    public HealthController(OscDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Health()
    {
        var dbOk = false;
        try
        {
            dbOk = await _db.Database.CanConnectAsync();
        }
        catch { /* DB not configured yet */ }

        return Ok(new ApiResponse<object>(true, new
        {
            status = "ok",
            timestamp = DateTimeOffset.UtcNow,
            version = "1.0.0",
            database = dbOk ? "connected" : "unavailable",
        }));
    }
}
