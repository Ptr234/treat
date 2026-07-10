using System.Security.Cryptography;
using System.Text;

namespace OscApi.Services;

public interface IS3UploadService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    string GenerateSignedUrl(string fileKey, int expirationMinutes = 60);
    Task DeleteFileAsync(string fileKey);
}

/// <summary>
/// S3 file upload service. Currently implements local storage simulation.
/// Ready for AWS SDK integration by swapping implementation.
/// </summary>
public class S3UploadService : IS3UploadService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<S3UploadService> _logger;
    private readonly string _s3Bucket;
    private readonly string _s3Region;
    private readonly string _s3BaseUrl;
    private readonly string _signedUrlSecret;

    public S3UploadService(IConfiguration config, IWebHostEnvironment env, ILogger<S3UploadService> logger)
    {
        _env = env;
        _logger = logger;
        _s3Bucket = config["S3:Bucket"] ?? "osc-uploads";
        _s3Region = config["S3:Region"] ?? "us-east-1";
        _s3BaseUrl = config["S3:BaseUrl"] ?? $"https://{_s3Bucket}.s3.{_s3Region}.amazonaws.com";
        _signedUrlSecret = config["S3:SignedUrlSecret"]
            ?? throw new InvalidOperationException("S3:SignedUrlSecret is not configured");
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        // For now, simulate S3 with local storage under /uploads
        // When AWS credentials are configured, this will be replaced with actual S3 client
        var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var safeFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var localPath = Path.Combine(uploadsDir, safeFileName);

        await using (var fileOutput = new FileStream(localPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileOutput);
        }

        // Return relative URL that DocumentsController can resolve
        var fileUrl = $"/uploads/{safeFileName}";
        _logger.LogInformation("Uploaded file to S3: {FileName} ({ContentType})", safeFileName, contentType);
        return fileUrl;
    }

    public string GenerateSignedUrl(string fileKey, int expirationMinutes = 60)
    {
        // Simple signed URL for demo; in production, use AWS SDK's signing
        // Format: base64(fileKey|timestamp|signature)
        var timestamp = DateTimeOffset.UtcNow.AddMinutes(expirationMinutes).ToUnixTimeSeconds();
        var message = $"{fileKey}|{timestamp}";
        var signature = HmacSha256(message, _signedUrlSecret);
        var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{message}|{signature}"));
        return $"{_s3BaseUrl}/{fileKey}?token={Uri.EscapeDataString(token)}&expires={timestamp}";
    }

    public async Task DeleteFileAsync(string fileKey)
    {
        // For local simulation: extract file name from URL and delete
        var fileName = Path.GetFileName(fileKey);
        var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads");
        var localPath = Path.Combine(uploadsDir, fileName);

        if (File.Exists(localPath))
        {
            File.Delete(localPath);
            _logger.LogInformation("Deleted file from S3: {FileKey}", fileKey);
        }

        await Task.CompletedTask;
    }

    private static string HmacSha256(string message, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToBase64String(hash);
    }
}
