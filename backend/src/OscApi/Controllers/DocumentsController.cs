using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;

namespace OscApi.Controllers;

[ApiController]
[Route("api/tickets/{refNumber}/documents")]
public class DocumentsController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly JwtService _jwt;
    private readonly IWebHostEnvironment _env;

    public DocumentsController(OscDbContext db, JwtService jwt, IWebHostEnvironment env)
    {
        _db = db;
        _jwt = jwt;
        _env = env;
    }

    /// <summary>List documents attached to a ticket.</summary>
    [HttpGet]
    public async Task<IActionResult> ListDocuments(string refNumber, [FromQuery] string? email)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Documents)
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null)
            return NotFound(new ApiResponse(false, "Ticket not found"));

        var isAdmin = IsAdmin();
        if (!isAdmin)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail)
                return StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        }

        var docs = ticket.Documents
            .OrderByDescending(d => d.UploadedAt)
            .Select(d => new { d.Id, d.FileName, d.MimeType, d.FileSize, d.StorageUrl, d.UploadedAt });

        return Ok(new ApiResponse<object>(true, docs));
    }

    /// <summary>Delete a document from a ticket (admin only).</summary>
    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> DeleteDocument(string refNumber, Guid documentId)
    {
        if (!IsAdmin()) return Unauthorized(new ApiResponse(false, "Admin access required"));

        var doc = await _db.TicketDocuments
            .Include(d => d.Ticket)
            .FirstOrDefaultAsync(d => d.Id == documentId && d.Ticket.ReferenceNumber == refNumber);

        if (doc is null)
            return NotFound(new ApiResponse(false, "Document not found"));

        // Delete physical file
        var filePath = Path.Combine(_env.ContentRootPath, doc.StorageUrl.TrimStart('/'));
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        _db.TicketDocuments.Remove(doc);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }

    private bool IsAdmin()
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token)) return false;
        var principal = _jwt.ValidateToken(token);
        return principal?.Claims.Any(c =>
            c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "admin") ?? false;
    }
}
