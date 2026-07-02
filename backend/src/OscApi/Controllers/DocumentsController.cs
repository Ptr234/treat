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
    private readonly IWebHostEnvironment _env;

    public DocumentsController(OscDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    /// <summary>
    /// The agency an agency_officer is scoped to (null for admin-level staff and
    /// for non-staff callers). Set <paramref name="misconfigured"/> when an
    /// officer has no agency configured.
    /// </summary>
    private string? AgencyScope(out bool misconfigured)
    {
        misconfigured = false;
        if (!User.IsAgencyOfficer()) return null;
        var code = User.GetAgencyCode();
        if (string.IsNullOrEmpty(code)) misconfigured = true;
        return code;
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

        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        if (!isStaff)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail)
                return StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        }
        else
        {
            var scope = AgencyScope(out var misconfigured);
            if (misconfigured) return Forbid();
            if (!string.IsNullOrEmpty(scope) && ticket.AssignedAgencyCode != scope)
                return NotFound(new ApiResponse(false, "Ticket not found"));
        }

        var docs = ticket.Documents
            .OrderByDescending(d => d.UploadedAt)
            .Select(d => new { d.Id, d.FileName, d.MimeType, d.FileSize, d.StorageUrl, d.UploadedAt });

        return Ok(new ApiResponse<object>(true, docs));
    }

    /// <summary>
    /// Download a document's content. Same access rules as listing: staff via
    /// session (agency officers only within their agency), the public via the
    /// ticket's filing email. Nothing else serves the uploads directory, so this
    /// is the only way stored files leave the server.
    /// </summary>
    [HttpGet("{documentId:guid}/content")]
    public async Task<IActionResult> DownloadDocument(string refNumber, Guid documentId, [FromQuery] string? email)
    {
        var doc = await _db.TicketDocuments
            .Include(d => d.Ticket)
            .FirstOrDefaultAsync(d => d.Id == documentId && d.Ticket.ReferenceNumber == refNumber);

        if (doc is null)
            return NotFound(new ApiResponse(false, "Document not found"));

        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        if (!isStaff)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != doc.Ticket.ContactEmail)
                return StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        }
        else
        {
            var scope = AgencyScope(out var misconfigured);
            if (misconfigured) return Forbid();
            if (!string.IsNullOrEmpty(scope) && doc.Ticket.AssignedAgencyCode != scope)
                return NotFound(new ApiResponse(false, "Document not found"));
        }

        var filePath = Path.Combine(_env.ContentRootPath, doc.StorageUrl.TrimStart('/'));
        if (!System.IO.File.Exists(filePath))
            return NotFound(new ApiResponse(false, "File is no longer available"));

        var stream = System.IO.File.OpenRead(filePath);
        // Force download (attachment) so a mislabelled file can never render
        // in the browser under this origin.
        return File(stream, doc.MimeType, doc.FileName);
    }

    /// <summary>Delete a document from a ticket (admin-level staff only).</summary>
    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> DeleteDocument(string refNumber, Guid documentId)
    {
        if (!User.IsAdminLevel()) return Unauthorized(new ApiResponse(false, "Admin access required"));

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
}
