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
    Task SendTicketAssignmentNotificationAsync(string toEmail, string recipientName, string referenceNumber, string title, string reason);
    Task SendSlaBreachNotificationAsync(string referenceNumber, string title, string owner, DateTimeOffset deadline, string status, string[]? additionalRecipients = null);
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

public enum EmailDeliveryOutcome { Sent, TransientFailure, PermanentFailure, NotConfigured }

/// <summary>The outcome of one delivery attempt to Resend.</summary>
public sealed record EmailDeliveryResult(EmailDeliveryOutcome Outcome, string? ProviderId = null, string? Error = null, TimeSpan? RetryAfter = null);

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

    // When set (production DI), emails are written to the durable outbox and
    // delivered by EmailOutboxWorker; without it (unit tests) they're sent inline.
    private readonly IEmailOutbox? _outbox;

    // Resend rate-limits each team (2 requests/second by default) and answers
    // 429 beyond that. A single contact form fires three sends at once
    // (investor confirmation, admin, agency), so sends are serialised and spaced.
    private readonly SemaphoreSlim _sendGate = new(1, 1);
    private readonly TimeSpan _minInterval;
    private readonly TimeSpan _retryBaseDelay;
    private DateTime _lastSendUtc = DateTime.MinValue;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
        : this(config, logger, SharedHttp, TimeSpan.FromMilliseconds(600), TimeSpan.FromSeconds(1)) { }

    /// <summary>Production: queue every email in the durable outbox.</summary>
    public EmailService(IConfiguration config, ILogger<EmailService> logger, IEmailOutbox outbox)
        : this(config, logger, SharedHttp, TimeSpan.FromMilliseconds(600), TimeSpan.FromSeconds(1), outbox) { }

    /// <summary>Test seam: inject the HTTP client and timings.</summary>
    public EmailService(IConfiguration config, ILogger<EmailService> logger, HttpClient http, TimeSpan minInterval, TimeSpan retryBaseDelay,
        IEmailOutbox? outbox = null)
    {
        _outbox = outbox;
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

    public async Task SendTicketAssignmentNotificationAsync(string toEmail, string recipientName, string referenceNumber, string title, string reason)
    {
        var ticketUrl = StaffTicketUrl(referenceNumber);
        await SendAsync(toEmail, $"Ticket {referenceNumber} — {reason}",
            htmlBody: EmailTemplates.TicketAssignment(recipientName, referenceNumber, title, reason, ticketUrl),
            textBody: $"Dear {recipientName},\n\n{reason}\nRef: {referenceNumber}\nSubject: {title}\nOpen: {ticketUrl}");
    }

    public async Task SendSlaBreachNotificationAsync(
        string referenceNumber, string title, string owner, DateTimeOffset deadline, string status, string[]? additionalRecipients = null)
    {
        var ticketUrl = StaffTicketUrl(referenceNumber);
        // Staff work on Kampala time (EAT, UTC+3, no daylight saving).
        var deadlineText = deadline.ToOffset(TimeSpan.FromHours(3)).ToString("d MMM yyyy, HH:mm") + " EAT";
        var subject = $"SLA BREACH: Ticket {referenceNumber}";
        var html = EmailTemplates.SlaBreachNotification(referenceNumber, title, owner, deadlineText, status, ticketUrl);
        var text = $"Ticket {referenceNumber} missed its SLA deadline ({deadlineText}) and was escalated automatically.\nSubject: {title}\nStatus: {status}\nOwner: {owner}\nOpen: {ticketUrl}";

        await SendAsync(_adminEmail, subject, htmlBody: html, textBody: text);
        foreach (var recipient in (additionalRecipients ?? []).Where(e => !string.IsNullOrEmpty(e) && e != _adminEmail).Distinct(StringComparer.OrdinalIgnoreCase))
            await SendAsync(recipient, subject, htmlBody: html, textBody: text);
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

        if (_outbox is not null)
        {
            await _outbox.EnqueueAsync(to, subject, json);
            return;
        }

        // No outbox (unit tests): send inline with a few quick retries.
        var idempotencyKey = Guid.NewGuid().ToString("N");
        for (var attempt = 1; attempt <= MaxAttempts; attempt++)
        {
            var result = await DeliverOnceAsync(json, idempotencyKey);
            if (result.Outcome == EmailDeliveryOutcome.Sent)
            {
                _logger.LogInformation("Email sent to {To}: {Subject} (Resend id {Id})", to, subject, result.ProviderId);
                return;
            }
            if (result.Outcome != EmailDeliveryOutcome.TransientFailure || attempt == MaxAttempts)
            {
                _logger.LogError("Email to {To} not sent: {Error} (attempt {Attempt}/{Max}): {Subject}",
                    to, result.Error, attempt, MaxAttempts, subject);
                return;
            }
            var backoff = TimeSpan.FromTicks(_retryBaseDelay.Ticks * (1L << (attempt - 1)));
            await Task.Delay(result.RetryAfter is { } ra && ra > backoff ? ra : backoff);
        }
    }

    /// <summary>
    /// One attempt to hand a prepared Resend payload over. Throttled (Resend
    /// allows ~2 requests/s) and idempotent: pass the same key on every retry so
    /// an attempt that timed out after Resend accepted it isn't delivered twice.
    /// </summary>
    public async Task<EmailDeliveryResult> DeliverOnceAsync(string payloadJson, string idempotencyKey)
    {
        if (string.IsNullOrEmpty(_apiKey))
            return new(EmailDeliveryOutcome.NotConfigured, Error: "Resend:ApiKey is not set");

        try
        {
            using var response = await PostThrottledAsync(payloadJson, idempotencyKey);
            if (response.IsSuccessStatusCode)
                return new(EmailDeliveryOutcome.Sent, ProviderId: await ReadIdAsync(response));

            var status = (int)response.StatusCode;
            var body = await response.Content.ReadAsStringAsync();
            // 401/403 (bad key, unverified sending domain) and 422 (invalid
            // address) won't succeed on retry; 429 and 5xx might.
            var transient = status == 429 || status >= 500;
            return new(transient ? EmailDeliveryOutcome.TransientFailure : EmailDeliveryOutcome.PermanentFailure,
                Error: $"Resend {status}: {body}", RetryAfter: response.Headers.RetryAfter?.Delta);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            return new(EmailDeliveryOutcome.TransientFailure, Error: $"{ex.GetType().Name}: {ex.Message}");
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
