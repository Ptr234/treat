using System.Text.Json;
using System.Text.Json.Serialization;

namespace OscApi.Common;

public interface IRecaptchaService
{
    bool IsConfigured { get; }

    /// <summary>Verify a reCAPTCHA v3 token. Returns true if valid or if reCAPTCHA is not configured.</summary>
    Task<bool> VerifyAsync(string? token);
}

public class RecaptchaService : IRecaptchaService
{
    private readonly HttpClient _http;
    private readonly string? _secretKey;
    private readonly double _minScore;
    private readonly ILogger<RecaptchaService> _logger;

    public RecaptchaService(HttpClient http, IConfiguration config, ILogger<RecaptchaService> logger)
    {
        _http = http;
        _logger = logger;
        _secretKey = config["Recaptcha:SecretKey"];
        _minScore = double.TryParse(config["Recaptcha:MinScore"], out var s) ? s : 0.5;
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_secretKey);

    /// <summary>
    /// Verify a reCAPTCHA v3 token. Returns true if valid or if reCAPTCHA is not configured.
    /// </summary>
    public async Task<bool> VerifyAsync(string? token)
    {
        if (!IsConfigured)
        {
            _logger.LogDebug("reCAPTCHA not configured — skipping verification");
            return true; // Allow through if not configured (dev mode)
        }

        if (string.IsNullOrEmpty(token))
            return false;

        try
        {
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = _secretKey!,
                ["response"] = token,
            });

            var response = await _http.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<RecaptchaResponse>(json);

            if (result is null || !result.Success)
            {
                _logger.LogWarning("reCAPTCHA verification failed: {Errors}", (object?)(result?.ErrorCodes));
                return false;
            }

            if (result.Score < _minScore)
            {
                _logger.LogWarning("reCAPTCHA score {Score} below threshold {Min}", result.Score, _minScore);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "reCAPTCHA verification error");
            return true; // Fail open to not block users on reCAPTCHA outage
        }
    }
}

file class RecaptchaResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("score")]
    public double Score { get; set; }

    [JsonPropertyName("action")]
    public string? Action { get; set; }

    [JsonPropertyName("error-codes")]
    public string[]? ErrorCodes { get; set; }
}
