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

        var body = new ApiResponse<object>(true, new
        {
            status = dbOk ? "ok" : "degraded",
            timestamp = DateTimeOffset.UtcNow,
            version = "1.0.0",
            database = dbOk ? "connected" : "unavailable",
        });

        // 503 when a dependency is down, so load balancers/orchestrators stop
        // routing traffic here instead of reading a 200 body to find out.
        return dbOk ? Ok(body) : StatusCode(StatusCodes.Status503ServiceUnavailable, body);
    }
}
