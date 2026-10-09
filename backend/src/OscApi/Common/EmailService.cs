using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace OscApi.Common;

public interface IEmailService
{
    Task SendTicketConfirmationAsync(string toEmail, string contactName, string referenceNumber, string title, string accessToken);
    Task SendTicketStatusUpdateAsync(string toEmail, string contactName, string referenceNumber, string newStatus, string accessToken);
    Task SendTicketReplyAsync(string toEmail, string contactName, string referenceNumber, string title, string reply, string accessToken);
    Task SendTicketAccessLinkAsync(string toEmail, string contactName, string referenceNumber, string title, string accessToken);
    Task SendTicketCommentNotificationAsync(string referenceNumber, string title, string contactName, string comment, string[]? additionalRecipients = null);
    Task SendEscalationNotificationAsync(string referenceNumber, string title, string contactName, string[]? additionalRecipients = null, string? customMessage = null);
    Task SendInvestorWelcomeAsync(string toEmail, string name, string referenceNumber);
    Task SendInvestorReferenceReminderAsync(string toEmail, string name, string referenceNumber);
    Task SendPasswordResetAsync(string toEmail, string name, string resetToken);
    Task SendEmailVerificationAsync(string toEmail, string name, string verificationToken);
    Task SendContactConfirmationAsync(string toEmail, string name, string referenceNumber, string agencyName, string subject);
    Task SendContactNotificationToAgencyAsync(string agencyCode, string agencyName, string referenceNumber, string contactName, string contactEmail, string subject, string message, string? agencyEmail = null);
    Task SendAppointmentConfirmationAsync(string toEmail, string name, string referenceNumber, string agencyName, string date, string time);
    Task SendAppointmentNotificationToAgencyAsync(string agencyCode, string agencyName, string referenceNumber, string contactName, string contactEmail, string contactPhone, string serviceType, string purpose, string date, string time, int durationMinutes, string meetingType, string? agencyEmail = null);
    Task SendBusinessRegistrationReceivedAsync(string toEmail, string contactName, string referenceNumber, string businessName);
    Task SendBusinessRegistrationStatusUpdateAsync(string toEmail, string contactName, string referenceNumber, string businessName, string newStatus);
    Task SendBusinessRegistrationCertificateIssuedAsync(string toEmail, string contactName, string referenceNumber, string businessName, string certificateNumber);
}

public class EmailService : IEmailService
{
    // One shared client for the process (the service is a singleton). The
    // default 100s timeout would let a stalled Resend call hold up every send
    // queued behind the gate below, so cap each attempt.
    private static readonly HttpClient SharedHttp = new() { Timeout = TimeSpan.FromSeconds(15) };

    private const int MaxAttempts = 3;

    private readonly HttpClient _http;
    private readonly string? _apiKey;
    private readonly string _fromAddress;
    private readonly string _adminEmail;
    private readonly string _siteUrl;
    private readonly ILogger<EmailService> _logger;

    // Resend rate-limits each team (2 requests/second by default) and answers
    // 429 beyond that. A single contact form fires three sends at once
    // (investor confirmation, admin, agency), so sends are serialised and spaced.
    private readonly SemaphoreSlim _sendGate = new(1, 1);
    private readonly TimeSpan _minInterval;
    private readonly TimeSpan _retryBaseDelay;
    private DateTime _lastSendUtc = DateTime.MinValue;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
        : this(config, logger, SharedHttp, TimeSpan.FromMilliseconds(600), TimeSpan.FromSeconds(1)) { }

    /// <summary>Test seam: inject the HTTP client and timings.</summary>
    public EmailService(IConfiguration config, ILogger<EmailService> logger, HttpClient http, TimeSpan minInterval, TimeSpan retryBaseDelay)
    {
        _logger = logger;
        _http = http;
        _minInterval = minInterval;
        _retryBaseDelay = retryBaseDelay;
        _apiKey = config["Resend:ApiKey"];
        _fromAddress = config["Resend:FromAddress"] ?? "notifications@oscdigitaltool.com";
        _adminEmail = config["Resend:AdminEmail"] ?? _fromAddress;
        _siteUrl = config["SiteUrl"] ?? "https://www.oscdigitaltool.com";

        if (string.IsNullOrEmpty(_apiKey))
            _logger.LogWarning("Resend:ApiKey is not set — no emails will be sent (from {From}).", _fromAddress);
    }

    // The tracking link carries the ticket's secret access token, never the
    // email address (which would leak into browser history and server logs and,
    // with sequential references, was effectively guessable).
    private string TrackUrl(string referenceNumber, string accessToken) =>
        $"{_siteUrl}/tickets/{Uri.EscapeDataString(referenceNumber)}?token={Uri.EscapeDataString(accessToken)}";

    private string StaffTicketUrl(string referenceNumber) =>
        $"{_siteUrl}/tickets/{Uri.EscapeDataString(referenceNumber)}";

    public async Task SendTicketConfirmationAsync(string toEmail, string contactName, string referenceNumber, string title, string accessToken)
    {
        var trackUrl = TrackUrl(referenceNumber, accessToken);
        await SendAsync(toEmail, $"Ticket {referenceNumber} Received",
            htmlBody: EmailTemplates.TicketConfirmation(contactName, referenceNumber, title, trackUrl),
            textBody: $"Dear {contactName},\n\nYour inquiry has been received.\nReference: {referenceNumber}\nSubject: {title}\nTrack: {trackUrl}");
    }

    public async Task SendTicketStatusUpdateAsync(string toEmail, string contactName, string referenceNumber, string newStatus, string accessToken)
    {
        var trackUrl = TrackUrl(referenceNumber, accessToken);
        await SendAsync(toEmail, $"Ticket {referenceNumber} — Status Update",
            htmlBody: EmailTemplates.TicketStatusUpdate(contactName, referenceNumber, newStatus, trackUrl),
            textBody: $"Dear {contactName},\n\nTicket {referenceNumber} updated to: {newStatus}\nView: {trackUrl}");
    }

    public async Task SendTicketReplyAsync(string toEmail, string contactName, string referenceNumber, string title, string reply, string accessToken)
    {
        var trackUrl = TrackUrl(referenceNumber, accessToken);
        await SendAsync(toEmail, $"New reply on ticket {referenceNumber}",
            htmlBody: EmailTemplates.TicketReply(contactName, referenceNumber, title, Preview(reply), trackUrl),
            textBody: $"Dear {contactName},\n\nThe OneStop Centre replied to your ticket {referenceNumber}:\n\n{Preview(reply)}\n\nView and reply: {trackUrl}");
    }

    public async Task SendTicketAccessLinkAsync(string toEmail, string contactName, string referenceNumber, string title, string accessToken)
    {
        var trackUrl = TrackUrl(referenceNumber, accessToken);
        await SendAsync(toEmail, $"Your link to ticket {referenceNumber}",
            htmlBody: EmailTemplates.TicketAccessLink(contactName, referenceNumber, title, trackUrl),
            textBody: $"Dear {contactName},\n\nHere is your private link to ticket {referenceNumber}:\n{trackUrl}\n\nIf you didn't ask for this, you can ignore this email.");
    }

    public async Task SendTicketCommentNotificationAsync(
        string referenceNumber, string title, string contactName, string comment, string[]? additionalRecipients = null)
    {
        var ticketUrl = StaffTicketUrl(referenceNumber);
        var subject = $"Investor replied on ticket {referenceNumber}";
        var html = EmailTemplates.TicketCommentNotification(referenceNumber, title, contactName, Preview(comment), ticketUrl);
        var text = $"{contactName} replied on ticket {referenceNumber} ({title}):\n\n{Preview(comment)}\n\nOpen: {ticketUrl}";

        await SendAsync(_adminEmail, subject, htmlBody: html, textBody: text);
        foreach (var recipient in (additionalRecipients ?? []).Where(e => !string.IsNullOrEmpty(e) && e != _adminEmail).Distinct())
            await SendAsync(recipient, subject, htmlBody: html, textBody: text);
    }

    private static string Preview(string text) => text.Length <= 600 ? text : text[..600] + "…";

    public async Task SendEscalationNotificationAsync(
        string referenceNumber, string title, string contactName,
        string[]? additionalRecipients = null, string? customMessage = null)
    {
        var dashboardUrl = StaffTicketUrl(referenceNumber);
        var subject = $"ESCALATION: Ticket {referenceNumber}";
        var html = EmailTemplates.EscalationNotification(referenceNumber, title, contactName, dashboardUrl, customMessage);
        var text = $"Ticket escalated.\nRef: {referenceNumber}\nSubject: {title}\nInvestor: {contactName}\n{customMessage}\nReview: {dashboardUrl}";

        // Send to default admin
        await SendAsync(_adminEmail, subject, htmlBody: html, textBody: text);

        // Send to all configured escalation recipients
        if (additionalRecipients is not null)
        {
            foreach (var recipient in additionalRecipients.Where(e => !string.IsNullOrEmpty(e) && e != _adminEmail).Distinct())
            {
                await SendAsync(recipient, subject, htmlBody: html, textBody: text);
            }
        }
    }

    public async Task SendBusinessRegistrationReceivedAsync(string toEmail, string contactName, string referenceNumber, string businessName)
    {
        var trackUrl = $"{_siteUrl}/business/registration/{referenceNumber}?email={Uri.EscapeDataString(toEmail)}";
        await SendAsync(toEmail, $"Business Registration {referenceNumber} Received — URSB",
            htmlBody: EmailTemplates.BusinessRegistrationReceived(contactName, referenceNumber, businessName, trackUrl),
            textBody: $"Dear {contactName},\n\nYour business registration for {businessName} has been received.\nReference: {referenceNumber}\nTrack: {trackUrl}");
    }

    public async Task SendBusinessRegistrationStatusUpdateAsync(string toEmail, string contactName, string referenceNumber, string businessName, string newStatus)
    {
        var trackUrl = $"{_siteUrl}/business/registration/{referenceNumber}?email={Uri.EscapeDataString(toEmail)}";
        await SendAsync(toEmail, $"Registration {referenceNumber} — Status Update",
            htmlBody: EmailTemplates.BusinessRegistrationStatusUpdate(contactName, referenceNumber, businessName, newStatus, trackUrl),
            textBody: $"Dear {contactName},\n\n{businessName} ({referenceNumber}) updated to: {newStatus}\nView: {trackUrl}");
    }

    public async Task SendBusinessRegistrationCertificateIssuedAsync(string toEmail, string contactName, string referenceNumber, string businessName, string certificateNumber)
    {
        var certificateUrl = $"{_siteUrl}/business/registration/{referenceNumber}/certificate?email={Uri.EscapeDataString(toEmail)}";
        await SendAsync(toEmail, $"Certificate Issued — {businessName}",
            htmlBody: EmailTemplates.BusinessRegistrationCertificateIssued(contactName, referenceNumber, businessName, certificateNumber, certificateUrl),
            textBody: $"Dear {contactName},\n\n{businessName} is now registered.\nCertificate: {certificateNumber}\nView: {certificateUrl}");
    }

    public async Task SendInvestorWelcomeAsync(string toEmail, string name, string referenceNumber)
    {
        await SendAsync(toEmail, "Welcome to Uganda Investment Authority",
            htmlBody: EmailTemplates.InvestorWelcome(name, referenceNumber),
            textBody: $"Dear {name},\n\nWelcome! Your investor profile has been created.\nReference: {referenceNumber}");
    }

    public async Task SendInvestorReferenceReminderAsync(string toEmail, string name, string referenceNumber)
    {
        await SendAsync(toEmail, "Your Investor Reference — Uganda Investment Authority",
            htmlBody: EmailTemplates.InvestorReferenceReminder(name, referenceNumber),
            textBody: $"Dear {name},\n\nYou already have an investor profile with us, so no new one was created.\nReference: {referenceNumber}");
    }

    public async Task SendPasswordResetAsync(string toEmail, string name, string resetToken)
    {
        var resetUrl = $"{_siteUrl}/auth/reset-password?token={Uri.EscapeDataString(resetToken)}";
        await SendAsync(toEmail, "Password Reset — OSC Digital Tool",
            htmlBody: EmailTemplates.PasswordReset(name, resetUrl),
            textBody: $"Dear {name},\n\nReset your password: {resetUrl}\n\nExpires in 1 hour.");
    }

    public async Task SendEmailVerificationAsync(string toEmail, string name, string verificationToken)
    {
        // Keep the secret in the URL fragment so it is never sent in HTTP
        // requests, server access logs, or Referer headers.
        var verificationUrl = $"{_siteUrl}/auth/verify-email#token={Uri.EscapeDataString(verificationToken)}";
        await SendAsync(toEmail, "Verify your OneStop Centre account",
            htmlBody: EmailTemplates.EmailVerification(name, verificationUrl),
            textBody: $"Dear {name},\n\nVerify your email address: {verificationUrl}\n\nThis link expires in 24 hours.");
    }

    public async Task SendContactConfirmationAsync(
        string toEmail, string name, string referenceNumber, string agencyName, string subject)
    {
        await SendAsync(toEmail, $"Inquiry {referenceNumber} Received — {agencyName}",
            htmlBody: EmailTemplates.ContactConfirmation(name, referenceNumber, agencyName, subject),
            textBody: $"Dear {name},\n\nInquiry to {agencyName} received.\nRef: {referenceNumber}\nSubject: {subject}");
    }

    public async Task SendContactNotificationToAgencyAsync(
        string agencyCode, string agencyName, string referenceNumber,
        string contactName, string contactEmail, string subject, string message,
        string? agencyEmail = null)
    {
        var dashboardUrl = $"{_siteUrl}/dashboard";
        var subjectLine = $"New Inquiry {referenceNumber} for {agencyCode}";
        var html = EmailTemplates.ContactNotificationToAgency(agencyName, agencyCode, referenceNumber, contactName, contactEmail, subject, message, dashboardUrl);
        var text = $"New inquiry via OSC portal.\n\nRef: {referenceNumber}\nAgency: {agencyName} ({agencyCode})\nFrom: {contactName} ({contactEmail})\nSubject: {subject}\n\nMessage:\n{message}\n\nReview: {dashboardUrl}";

        // Replying goes straight to the investor rather than the no-reply sender.
        await SendAsync(_adminEmail, subjectLine, htmlBody: html, textBody: text, replyTo: contactEmail);

        // Send to actual agency email if provided
        if (!string.IsNullOrEmpty(agencyEmail) && agencyEmail != _adminEmail)
            await SendAsync(agencyEmail, subjectLine, htmlBody: html, textBody: text, replyTo: contactEmail);
    }

    public async Task SendAppointmentConfirmationAsync(
        string toEmail, string name, string referenceNumber,
        string agencyName, string date, string time)
    {
        await SendAsync(toEmail, $"Appointment Request {referenceNumber} — {agencyName}",
            htmlBody: EmailTemplates.AppointmentConfirmation(name, referenceNumber, agencyName, date, time),
            textBody: $"Dear {name},\n\nAppointment request with {agencyName} received.\nRef: {referenceNumber}\nDate: {date} at {time}");
    }

    public async Task SendAppointmentNotificationToAgencyAsync(
        string agencyCode, string agencyName, string referenceNumber,
        string contactName, string contactEmail, string contactPhone,
        string serviceType, string purpose, string date, string time,
        int durationMinutes, string meetingType, string? agencyEmail = null)
    {
        var dashboardUrl = $"{_siteUrl}/dashboard";
        var subjectLine = $"Appointment Request {referenceNumber} for {agencyCode}";
        var html = EmailTemplates.AppointmentNotificationToAgency(agencyName, agencyCode, referenceNumber, contactName, contactEmail, contactPhone, serviceType, purpose, date, time, durationMinutes, meetingType, dashboardUrl);
        var text = $"Appointment request via OSC portal.\n\nRef: {referenceNumber}\nAgency: {agencyName} ({agencyCode})\nContact: {contactName} ({contactEmail}, {contactPhone})\nService: {serviceType}\nPurpose: {purpose}\nDate: {date} at {time}\nDuration: {durationMinutes}min ({meetingType})\n\nReview: {dashboardUrl}";

        await SendAsync(_adminEmail, subjectLine, htmlBody: html, textBody: text, replyTo: contactEmail);

        if (!string.IsNullOrEmpty(agencyEmail) && agencyEmail != _adminEmail)
            await SendAsync(agencyEmail, subjectLine, htmlBody: html, textBody: text, replyTo: contactEmail);
    }

    private static readonly string[] ReservedTlds = [".invalid", ".local", ".localhost", ".test", ".example"];

    public static bool IsUndeliverable(string address)
    {
        var domain = address.Trim().TrimEnd('.').ToLowerInvariant();
        return ReservedTlds.Any(tld => domain.EndsWith(tld, StringComparison.Ordinal));
    }

    private async Task SendAsync(string to, string subject, string? textBody = null, string? htmlBody = null, string? replyTo = null)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Resend not configured — email to {To} skipped: {Subject}", to, subject);
            return;
        }

        // Reserved TLDs (RFC 2606/6761) can never be delivered — e.g. the
        // placeholder address anonymous feedback is filed under. Sending would
        // only bounce and hurt the sending domain's reputation.
        if (IsUndeliverable(to))
        {
            _logger.LogInformation("Email to reserved-domain address {To} skipped: {Subject}", to, subject);
            return;
        }

        var payload = new Dictionary<string, object?>
        {
            ["from"] = _fromAddress,
            ["to"] = new[] { to },
            ["subject"] = subject,
        };
        if (!string.IsNullOrEmpty(htmlBody)) payload["html"] = htmlBody;
        if (!string.IsNullOrEmpty(textBody)) payload["text"] = textBody;
        if (!string.IsNullOrEmpty(replyTo) && !IsUndeliverable(replyTo)) payload["reply_to"] = new[] { replyTo };
        var json = JsonSerializer.Serialize(payload);

        // Same key on every retry: if an attempt timed out after Resend had
        // already accepted it, the retry is deduplicated instead of delivered twice.
        var idempotencyKey = Guid.NewGuid().ToString("N");

        for (var attempt = 1; attempt <= MaxAttempts; attempt++)
        {
            TimeSpan? retryAfter = null;
            try
            {
                using var response = await PostThrottledAsync(json, idempotencyKey);
                if (response.IsSuccessStatusCode)
                {
                    var id = await ReadIdAsync(response);
                    _logger.LogInformation("Email sent to {To}: {Subject} (Resend id {Id})", to, subject, id);
                    return;
                }

                var status = (int)response.StatusCode;
                var body = await response.Content.ReadAsStringAsync();
                var transient = status == 429 || status >= 500;
                if (!transient || attempt == MaxAttempts)
                {
                    // 401/403 (bad key, unverified sending domain) and 422
                    // (invalid address) will not succeed on retry.
                    _logger.LogError("Resend API error sending to {To}: {Status} {Body} (attempt {Attempt}/{Max}): {Subject}",
                        to, status, body, attempt, MaxAttempts, subject);
                    return;
                }

                retryAfter = response.Headers.RetryAfter?.Delta;
                _logger.LogWarning("Resend returned {Status} for {To}; retrying (attempt {Attempt}/{Max})",
                    status, to, attempt, MaxAttempts);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                if (attempt == MaxAttempts)
                {
                    _logger.LogError(ex, "Failed to send email to {To} after {Max} attempts: {Subject}", to, MaxAttempts, subject);
                    return;
                }
                _logger.LogWarning(ex, "Network error sending email to {To}; retrying (attempt {Attempt}/{Max})",
                    to, attempt, MaxAttempts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}: {Subject}", to, subject);
                return;
            }

            var backoff = TimeSpan.FromTicks(_retryBaseDelay.Ticks * (1L << (attempt - 1)));
            await Task.Delay(retryAfter is { } ra && ra > backoff ? ra : backoff);
        }
    }

    private async Task<HttpResponseMessage> PostThrottledAsync(string json, string idempotencyKey)
    {
        await _sendGate.WaitAsync();
        try
        {
            var wait = _lastSendUtc + _minInterval - DateTime.UtcNow;
            if (wait > TimeSpan.Zero) await Task.Delay(wait);

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            request.Headers.Add("Idempotency-Key", idempotencyKey);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            try
            {
                return await _http.SendAsync(request);
            }
            finally
            {
                _lastSendUtc = DateTime.UtcNow;
            }
        }
        finally
        {
            _sendGate.Release();
        }
    }

    private static async Task<string?> ReadIdAsync(HttpResponseMessage response)
    {
        try
        {
            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return doc.RootElement.TryGetProperty("id", out var id) ? id.GetString() : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
