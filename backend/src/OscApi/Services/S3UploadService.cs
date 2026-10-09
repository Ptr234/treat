using System.Security.Cryptography;
using System.Text;
using OscApi.Common;

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
    private readonly string _uploadsRoot;
    private readonly ILogger<S3UploadService> _logger;
    private readonly string _s3Bucket;
    private readonly string _s3Region;
    private readonly string _s3BaseUrl;
    private readonly string _signedUrlSecret;

    public S3UploadService(IConfiguration config, IWebHostEnvironment env, ILogger<S3UploadService> logger)
    {
        _env = env;
        _logger = logger;
        _uploadsRoot = UploadStorage.Root(config, env);
        _s3Bucket = config["S3:Bucket"] ?? "osc-uploads";
        _s3Region = config["S3:Region"] ?? "us-east-1";
        _s3BaseUrl = config["S3:BaseUrl"] ?? $"https://{_s3Bucket}.s3.{_s3Region}.amazonaws.com";
        _signedUrlSecret = config["S3:SignedUrlSecret"]
            ?? throw new InvalidOperationException("S3:SignedUrlSecret is not configured");
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        // Local-disk storage under Uploads:Directory (see UploadStorage). Object
        // storage would replace this when running more than one instance.
        var uploadsDir = _uploadsRoot;
        Directory.CreateDirectory(uploadsDir);

        var safeFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var localPath = Path.Combine(uploadsDir, safeFileName);

        await using (var fileOutput = new FileStream(localPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileOutput);
        }

        // Return relative URL that DocumentsController can resolve
        var fileUrl = $"/uploads/{safeFileName}";
        _logger.LogInformation("Stored upload {FileName} ({ContentType}) in {Directory}", safeFileName, contentType, uploadsDir);
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
        var localPath = UploadStorage.PathFor(_uploadsRoot, fileKey);

        if (File.Exists(localPath))
        {
            File.Delete(localPath);
            _logger.LogInformation("Deleted stored upload {FileKey}", fileKey);
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
