using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "image/webp",
        "text/plain",
    };

    public UploadController(OscDbContext db, IWebHostEnvironment env, ILogger<UploadController> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    /// <summary>Upload files and optionally attach them to a ticket.</summary>
    [HttpPost]
    [RequestSizeLimit(MaxFileSize * MaxFilesPerRequest)]
    public async Task<IActionResult> Upload(
        [FromForm] List<IFormFile> files,
        [FromForm] string? ticketRefNumber)
    {
        if (files is null || files.Count == 0)
            return BadRequest(new ApiResponse(false, "No files provided"));

        if (files.Count > MaxFilesPerRequest)
            return BadRequest(new ApiResponse(false, $"Maximum {MaxFilesPerRequest} files per upload"));

        var uploadDir = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadDir);

        Ticket? ticket = null;
        if (!string.IsNullOrEmpty(ticketRefNumber))
        {
            ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == ticketRefNumber);
            if (ticket is null)
                return NotFound(new ApiResponse(false, "Ticket not found"));
        }

        var results = new List<object>();

        foreach (var file in files)
        {
            if (file.Length > MaxFileSize)
                return BadRequest(new ApiResponse(false, $"File '{file.FileName}' exceeds {MaxFileSize / 1024 / 1024}MB limit"));

            if (!AllowedMimeTypes.Contains(file.ContentType))
                return BadRequest(new ApiResponse(false, $"File type '{file.ContentType}' is not allowed"));

            var safeFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadDir, safeFileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var storageUrl = $"/uploads/{safeFileName}";

            if (ticket is not null)
            {
                var doc = new TicketDocument
                {
                    TicketId = ticket.Id,
                    FileName = file.FileName,
                    MimeType = file.ContentType,
                    FileSize = file.Length,
                    StorageUrl = storageUrl,
                };
                _db.TicketDocuments.Add(doc);
                results.Add(new { doc.Id, doc.FileName, doc.MimeType, doc.FileSize, doc.StorageUrl });
            }
            else
            {
                results.Add(new { FileName = file.FileName, MimeType = file.ContentType, FileSize = file.Length, StorageUrl = storageUrl });
            }
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Uploaded {Count} file(s) for ticket {Ref}", files.Count, ticketRefNumber ?? "none");

        return Ok(new ApiResponse<object>(true, new { files = results }));
    }
}
