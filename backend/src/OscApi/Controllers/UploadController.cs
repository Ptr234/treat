using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<UploadController> _logger;

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
    private const int MaxFilesPerRequest = 5;
    private const int MaxDocumentsPerTicket = 20;

    // Allowed document types. The stored extension is derived from the MIME type
    // (never from the client-supplied file name), so a disguised executable or
    // HTML file can't be persisted under its real extension.
    private static readonly Dictionary<string, string> MimeToExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        ["application/pdf"] = ".pdf",
        ["application/msword"] = ".doc",
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = ".docx",
        ["application/vnd.ms-excel"] = ".xls",
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = ".xlsx",
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
        ["text/plain"] = ".txt",
    };

    public UploadController(OscDbContext db, IWebHostEnvironment env, ILogger<UploadController> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// Attach files to a ticket. Staff upload via their session (agency officers
    /// only within their agency); the public must supply the email the ticket was
    /// filed with. Files are validated before anything is written to disk.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    [RequestSizeLimit(MaxFileSize * MaxFilesPerRequest)]
    public async Task<IActionResult> Upload(
        [FromForm] List<IFormFile> files,
        [FromForm] string? ticketRefNumber,
        [FromForm] string? contactEmail)
    {
        if (files is null || files.Count == 0)
            return BadRequest(new ApiResponse(false, "No files provided"));

        if (files.Count > MaxFilesPerRequest)
            return BadRequest(new ApiResponse(false, $"Maximum {MaxFilesPerRequest} files per upload"));

        if (string.IsNullOrWhiteSpace(ticketRefNumber))
            return BadRequest(new ApiResponse(false, "ticketRefNumber is required"));

        var ticket = await _db.Tickets
            .Include(t => t.Documents)
            .FirstOrDefaultAsync(t => t.ReferenceNumber == ticketRefNumber);
        if (ticket is null)
            return NotFound(new ApiResponse(false, "Ticket not found"));

        // ── Authorization ────────────────────────────────────────────────
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        if (isStaff)
        {
            if (User.IsAgencyOfficer())
            {
                var scope = User.GetAgencyCode();
                if (string.IsNullOrEmpty(scope)) return Forbid();
                if (ticket.AssignedAgencyCode != scope)
                    return NotFound(new ApiResponse(false, "Ticket not found"));
            }
        }
        else
        {
            // Public caller: must prove ownership with the filing email.
            if (string.IsNullOrWhiteSpace(contactEmail) ||
                contactEmail.ToLowerInvariant().Trim() != ticket.ContactEmail)
                return StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        }

        if (ticket.Documents.Count + files.Count > MaxDocumentsPerTicket)
            return BadRequest(new ApiResponse(false, $"A ticket can hold at most {MaxDocumentsPerTicket} documents"));

        // ── Validate everything before writing anything ──────────────────
        foreach (var file in files)
        {
            if (file.Length == 0)
                return BadRequest(new ApiResponse(false, $"File '{file.FileName}' is empty"));

            if (file.Length > MaxFileSize)
                return BadRequest(new ApiResponse(false, $"File '{file.FileName}' exceeds {MaxFileSize / 1024 / 1024}MB limit"));

            if (!MimeToExtension.ContainsKey(file.ContentType))
                return BadRequest(new ApiResponse(false, $"File type '{file.ContentType}' is not allowed"));
        }

        var uploadDir = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadDir);

        var results = new List<object>();

        foreach (var file in files)
        {
            var safeFileName = $"{Guid.NewGuid()}{MimeToExtension[file.ContentType]}";
            var filePath = Path.Combine(uploadDir, safeFileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var displayName = SanitizeHelper.StripHtml(Path.GetFileName(file.FileName));
            if (displayName.Length > 255) displayName = displayName[^255..];

            var doc = new TicketDocument
            {
                TicketId = ticket.Id,
                FileName = displayName,
                MimeType = file.ContentType,
                FileSize = file.Length,
                StorageUrl = $"/uploads/{safeFileName}",
            };
            _db.TicketDocuments.Add(doc);
            results.Add(new { doc.Id, doc.FileName, doc.MimeType, doc.FileSize, doc.StorageUrl });
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Uploaded {Count} file(s) for ticket {Ref}", files.Count, ticketRefNumber);

        return Ok(new ApiResponse<object>(true, new { files = results }));
    }
}
