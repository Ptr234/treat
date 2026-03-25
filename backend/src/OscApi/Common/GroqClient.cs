using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OscApi.Common;

public class GroqClient
{
    private readonly HttpClient _http;
    private readonly string _model;
    private readonly ILogger<GroqClient> _logger;
    private readonly bool _isConfigured;

    public GroqClient(HttpClient http, IConfiguration config, ILogger<GroqClient> logger)
    {
        _http = http;
        _logger = logger;
        _model = config["Groq:Model"] ?? "llama-3.3-70b-versatile";

        var apiKey = config["Groq:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Groq:ApiKey is not configured — chatbot AI will be unavailable");
            _isConfigured = false;
            return;
        }

        _isConfigured = true;
        _http.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public bool IsConfigured => _isConfigured;

    public async Task<string> ChatAsync(List<ChatMessage> messages, double temperature = 0.7, int maxTokens = 1024)
    {
        if (!_isConfigured)
            throw new InvalidOperationException("Groq API key is not configured");

        var payload = new
        {
            model = _model,
            messages = messages.Select(m => new { role = m.Role, content = m.Content }),
            temperature,
            max_tokens = maxTokens,
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _http.PostAsync("chat/completions", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Groq API error {StatusCode}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Groq API returned {response.StatusCode}");
        }

        var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
        return result?.Choices?.FirstOrDefault()?.Message?.Content ?? string.Empty;
    }

    public record ChatMessage(string Role, string Content);

    private class GroqResponse
    {
        [JsonPropertyName("choices")]
        public List<GroqChoice>? Choices { get; set; }
    }

    private class GroqChoice
    {
        [JsonPropertyName("message")]
        public GroqMessage? Message { get; set; }
    }

    private class GroqMessage
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
