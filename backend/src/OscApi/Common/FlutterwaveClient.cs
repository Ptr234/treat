using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;

namespace OscApi.Common;

public interface IFlutterwaveClient
{
    bool IsConfigured { get; }

    /// <summary>Create a Standard hosted-checkout payment and return its link.</summary>
    Task<string> InitiatePaymentAsync(string txRef, decimal amount, string currency, string redirectUrl, string customerEmail, string customerName);

    /// <summary>Re-fetch a transaction from Flutterwave's own API by its numeric id —
    /// the only trustworthy source for a transaction's real amount/status, since a
    /// webhook body can be forged.</summary>
    Task<FlutterwaveTransaction?> VerifyTransactionAsync(string transactionId);

    /// <summary>Compare a webhook request's "verif-hash" header against the secret
    /// hash configured in the Flutterwave dashboard.</summary>
    bool VerifyWebhookSignature(string? receivedHash);
}

public class FlutterwaveClient : IFlutterwaveClient
{
    private readonly HttpClient _http;
    private readonly ILogger<FlutterwaveClient> _logger;
    private readonly string? _webhookSecretHash;
    private readonly bool _isConfigured;

    public FlutterwaveClient(HttpClient http, IConfiguration config, ILogger<FlutterwaveClient> logger)
    {
        _http = http;
        _logger = logger;
        _webhookSecretHash = config["Flutterwave:WebhookSecretHash"];

        var secretKey = config["Flutterwave:SecretKey"];
        if (string.IsNullOrEmpty(secretKey))
        {
            _logger.LogWarning("Flutterwave:SecretKey is not configured — online registration-fee payment will be unavailable");
            _isConfigured = false;
            return;
        }

        _isConfigured = true;
        _http.BaseAddress = new Uri("https://api.flutterwave.com/v3/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);
    }

    public bool IsConfigured => _isConfigured;

    public async Task<string> InitiatePaymentAsync(string txRef, decimal amount, string currency, string redirectUrl, string customerEmail, string customerName)
    {
        if (!_isConfigured)
            throw new InvalidOperationException("Flutterwave is not configured");

        var payload = new
        {
            tx_ref = txRef,
            amount,
            currency,
            redirect_url = redirectUrl,
            customer = new { email = customerEmail, name = customerName },
            customizations = new { title = "URSB Business Registration Fee", description = $"Registration fee for {txRef}" },
        };

        var response = await _http.PostAsJsonAsync("payments", payload);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Flutterwave payment initiation failed {StatusCode}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Flutterwave API returned {response.StatusCode}");
        }

        var result = await response.Content.ReadFromJsonAsync<FlutterwaveInitiateResponse>();
        var link = result?.Data?.Link;
        if (string.IsNullOrEmpty(link))
            throw new HttpRequestException("Flutterwave did not return a payment link");
        return link;
    }

    public async Task<FlutterwaveTransaction?> VerifyTransactionAsync(string transactionId)
    {
        if (!_isConfigured)
            throw new InvalidOperationException("Flutterwave is not configured");

        var response = await _http.GetAsync($"transactions/{transactionId}/verify");
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Flutterwave transaction verification failed {StatusCode} for {TransactionId}", response.StatusCode, transactionId);
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<FlutterwaveVerifyResponse>();
        return result?.Data;
    }

    /// <summary>
    /// Flutterwave signs webhook calls by echoing a static secret back verbatim in
    /// the "verif-hash" header (not an HMAC of the body) — so verification is just
    /// comparing it to the value configured in the dashboard. Constant-time to
    /// avoid a timing side-channel on the comparison.
    /// </summary>
    public bool VerifyWebhookSignature(string? receivedHash)
    {
        if (string.IsNullOrEmpty(_webhookSecretHash) || string.IsNullOrEmpty(receivedHash))
            return false;

        var expected = Encoding.UTF8.GetBytes(_webhookSecretHash);
        var actual = Encoding.UTF8.GetBytes(receivedHash);
        return expected.Length == actual.Length && CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    private class FlutterwaveInitiateResponse
    {
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("data")] public FlutterwaveLinkData? Data { get; set; }
    }

    private class FlutterwaveLinkData
    {
        [JsonPropertyName("link")] public string? Link { get; set; }
    }

    private class FlutterwaveVerifyResponse
    {
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("data")] public FlutterwaveTransaction? Data { get; set; }
    }
}

/// <summary>The subset of Flutterwave's transaction-verification response this app relies on.</summary>
public class FlutterwaveTransaction
{
    [JsonPropertyName("id")] public long Id { get; set; }
    [JsonPropertyName("tx_ref")] public string TxRef { get; set; } = string.Empty;
    [JsonPropertyName("amount")] public decimal Amount { get; set; }
    [JsonPropertyName("currency")] public string Currency { get; set; } = string.Empty;
    [JsonPropertyName("status")] public string Status { get; set; } = string.Empty; // "successful" | "failed" | ...
}
