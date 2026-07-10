using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Models;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IS3UploadService _s3Upload;
    private readonly ILogger<UploadController> _logger;

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
    private const int MaxFilesPerRequest = 5;
    private const int MaxDocumentsPerTicket = 20;

    // Allowed document types. The stored extension is derived from the MIME type
    // (never from the client-supplied file name), so a disguised executable or
    // HTML file can't be persisted under its real extension. The MIME type itself
    // is verified against the file's actual byte signature in HasValidSignatureAsync
    // — the client-supplied Content-Type header alone can't be trusted.
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

    public UploadController(OscDbContext db, IS3UploadService s3Upload, ILogger<UploadController> logger)
    {
        _db = db;
        _s3Upload = s3Upload;
        _logger = logger;
    }

    /// <summary>
    /// Confirms the file's actual bytes match its declared Content-Type, so an
    /// executable or HTML file relabeled with an allowed MIME type is rejected
    /// rather than trusted on the client-supplied header alone.
    /// </summary>
    private static async Task<bool> HasValidSignatureAsync(IFormFile file)
    {
        var buffer = new byte[12];
        await using var stream = file.OpenReadStream();
        var read = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length));

        bool StartsWith(byte[] signature) =>
            read >= signature.Length && buffer.AsSpan(0, signature.Length).SequenceEqual(signature);

        return file.ContentType.ToLowerInvariant() switch
        {
            "application/pdf" => StartsWith([0x25, 0x50, 0x44, 0x46]), // %PDF
            "image/jpeg" => StartsWith([0xFF, 0xD8, 0xFF]),
            "image/png" => StartsWith([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
            "image/webp" => StartsWith([0x52, 0x49, 0x46, 0x46]) // "RIFF"
                && read >= 12 && Encoding.ASCII.GetString(buffer, 8, 4) == "WEBP",
            "application/msword" or "application/vnd.ms-excel" =>
                StartsWith([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]), // OLE2 compound file
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" =>
                StartsWith([0x50, 0x4B, 0x03, 0x04]), // ZIP-based Office Open XML
            "text/plain" => true, // no reliable magic number; the extension is inert in a browser
            _ => false,
        };
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

            if (!await HasValidSignatureAsync(file))
                return BadRequest(new ApiResponse(false, $"File '{file.FileName}' does not match its declared type '{file.ContentType}'"));
        }

        var results = new List<object>();

        foreach (var file in files)
        {
            try
            {
                // Upload to S3 (or S3-compatible storage)
                await using var stream = file.OpenReadStream();
                var safeFileName = $"{Guid.NewGuid()}{MimeToExtension[file.ContentType]}";
                var storageUrl = await _s3Upload.UploadFileAsync(stream, safeFileName, file.ContentType);

                var displayName = SanitizeHelper.StripHtml(Path.GetFileName(file.FileName));
                if (displayName.Length > 255) displayName = displayName[^255..];

                var doc = new TicketDocument
                {
                    TicketId = ticket.Id,
                    FileName = displayName,
                    MimeType = file.ContentType,
                    FileSize = file.Length,
                    StorageUrl = storageUrl,
                };
                _db.TicketDocuments.Add(doc);
                results.Add(new { doc.Id, doc.FileName, doc.MimeType, doc.FileSize, doc.StorageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file {FileName}", file.FileName);
                return StatusCode(500, new ApiResponse(false, $"Failed to upload {file.FileName}"));
            }
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Uploaded {Count} file(s) for ticket {Ref}", files.Count, ticketRefNumber);

        return Ok(new ApiResponse<object>(true, new { files = results }));
    }
}
