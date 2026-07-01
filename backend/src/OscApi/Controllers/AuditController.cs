using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Data;
using OscApi.Dtos.Common;

namespace OscApi.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize(Policy = "AdminOnly")]
public class AuditController : ControllerBase
{
    private readonly OscDbContext _db;

    public AuditController(OscDbContext db) => _db = db;

    /// <summary>Paginated, filterable view of the audit trail (most recent first).</summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] int from = 0,
        [FromQuery] int to = 100,
        [FromQuery] string? actor = null,
        [FromQuery] string? action = null)
    {
        var query = _db.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(actor))
            query = query.Where(a => a.ActorEmail.Contains(actor));
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action.Contains(action));

        var total = await query.CountAsync();
        var take = Math.Clamp(to - from, 1, 200);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip(Math.Max(0, from))
            .Take(take)
            .Select(a => new
            {
                a.Timestamp,
                a.ActorEmail,
                a.ActorRole,
                a.Action,
                a.Details,
                a.StatusCode,
                a.IpAddress,
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, new { items, total }));
    }
}
