using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;

namespace OscApi.Controllers;

[ApiController]
[Route("api/v1/tickets/{refNumber}/documents")]
public class DocumentsController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IWebHostEnvironment _env;

    public DocumentsController(OscDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    /// <summary>List documents attached to a ticket.</summary>
    [HttpGet]
    public async Task<IActionResult> ListDocuments(string refNumber, [FromQuery] string? token)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Documents)
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        var who = TicketRequester.From(User, token);
        if (who.IsMisconfiguredOfficer(User)) return Forbid();
        // One 404 for "missing" and "not yours", so references can't be probed.
        if (ticket is null || !TicketAccess.CanView(ticket, who))
            return Problem(detail: "Ticket not found", statusCode: StatusCodes.Status404NotFound);

        var docs = ticket.Documents
            .OrderByDescending(d => d.UploadedAt)
            .Select(d => new { d.Id, d.FileName, d.MimeType, d.FileSize, d.StorageUrl, d.UploadedAt });

        return Ok(new ApiResponse<object>(true, docs));
    }

    /// <summary>
    /// Download a document's content. Same access rules as listing: staff via
    /// session (agency officers only within their agency), the public via the
    /// ticket's tracking token (or a signed-in owner). Nothing else serves the uploads directory, so this
    /// is the only way stored files leave the server.
    /// </summary>
    [HttpGet("{documentId:guid}/content")]
    public async Task<IActionResult> DownloadDocument(string refNumber, Guid documentId, [FromQuery] string? token)
    {
        var doc = await _db.TicketDocuments
            .Include(d => d.Ticket)
            .FirstOrDefaultAsync(d => d.Id == documentId && d.Ticket.ReferenceNumber == refNumber);

        var who = TicketRequester.From(User, token);
        if (who.IsMisconfiguredOfficer(User)) return Forbid();
        if (doc is null || !TicketAccess.CanView(doc.Ticket, who))
            return Problem(detail: "Document not found", statusCode: StatusCodes.Status404NotFound);

        var filePath = Path.Combine(_env.ContentRootPath, doc.StorageUrl.TrimStart('/'));
        if (!System.IO.File.Exists(filePath))
            return Problem(detail: "File is no longer available", statusCode: StatusCodes.Status404NotFound);

        var stream = System.IO.File.OpenRead(filePath);
        // Force download (attachment) so a mislabelled file can never render
        // in the browser under this origin.
        return File(stream, doc.MimeType, doc.FileName);
    }

    /// <summary>Delete a document from a ticket (admin-level staff only).</summary>
    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> DeleteDocument(string refNumber, Guid documentId)
    {
        if (!User.IsAdminLevel()) return Problem(detail: "Admin access required", statusCode: StatusCodes.Status401Unauthorized);

        var doc = await _db.TicketDocuments
            .Include(d => d.Ticket)
            .FirstOrDefaultAsync(d => d.Id == documentId && d.Ticket.ReferenceNumber == refNumber);

        if (doc is null)
            return Problem(detail: "Document not found", statusCode: StatusCodes.Status404NotFound);

        // Delete physical file
        var filePath = Path.Combine(_env.ContentRootPath, doc.StorageUrl.TrimStart('/'));
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        _db.TicketDocuments.Remove(doc);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }
}
