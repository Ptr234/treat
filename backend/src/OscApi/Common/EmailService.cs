using PostmarkDotNet;

namespace OscApi.Common;

public class EmailService
{
    private readonly PostmarkClient? _client;
    private readonly string _fromAddress;
    private readonly string _adminEmail;
    private readonly string _siteUrl;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _logger = logger;
        var token = config["Postmark:ServerToken"];
        _client = string.IsNullOrEmpty(token) ? null : new PostmarkClient(token);
        _fromAddress = config["Postmark:FromAddress"] ?? "notifications@www.oscdigitaltool.com";
        _adminEmail = config["Postmark:AdminEmail"] ?? _fromAddress;
        _siteUrl = config["SiteUrl"] ?? "https://www.oscdigitaltool.com";
    }

    public async Task SendTicketConfirmationAsync(string toEmail, string contactName, string referenceNumber, string title)
    {
        var trackUrl = $"{_siteUrl}/tickets/{referenceNumber}?email={Uri.EscapeDataString(toEmail)}";
        await SendAsync(toEmail, $"Ticket {referenceNumber} Received",
            htmlBody: EmailTemplates.TicketConfirmation(contactName, referenceNumber, title, trackUrl),
            textBody: $"Dear {contactName},\n\nYour inquiry has been received.\nReference: {referenceNumber}\nSubject: {title}\nTrack: {trackUrl}");
    }

    public async Task SendTicketStatusUpdateAsync(string toEmail, string contactName, string referenceNumber, string newStatus)
    {
        var trackUrl = $"{_siteUrl}/tickets/{referenceNumber}?email={Uri.EscapeDataString(toEmail)}";
        await SendAsync(toEmail, $"Ticket {referenceNumber} — Status Update",
            htmlBody: EmailTemplates.TicketStatusUpdate(contactName, referenceNumber, newStatus, trackUrl),
            textBody: $"Dear {contactName},\n\nTicket {referenceNumber} updated to: {newStatus}\nView: {trackUrl}");
    }

    public async Task SendEscalationNotificationAsync(
        string referenceNumber, string title, string contactName,
        string[]? additionalRecipients = null, string? customMessage = null)
    {
        var dashboardUrl = $"{_siteUrl}/dashboard";
        var subject = $"ESCALATION: Ticket {referenceNumber}";
        var html = EmailTemplates.EscalationNotification(referenceNumber, title, contactName, dashboardUrl, customMessage);
        var text = $"Ticket escalated.\nRef: {referenceNumber}\nSubject: {title}\nInvestor: {contactName}\n{customMessage}\nReview: {dashboardUrl}";

        // Send to default admin
        await SendAsync(_adminEmail, subject, htmlBody: html, textBody: text);

        // Send to all configured escalation recipients
        if (additionalRecipients is not null)
        {
            foreach (var recipient in additionalRecipients.Where(e => !string.IsNullOrEmpty(e) && e != _adminEmail))
            {
                await SendAsync(recipient, subject, htmlBody: html, textBody: text);
            }
        }
    }

    public async Task SendInvestorWelcomeAsync(string toEmail, string name, string referenceNumber)
    {
        await SendAsync(toEmail, "Welcome to Uganda Investment Authority",
            htmlBody: EmailTemplates.InvestorWelcome(name, referenceNumber),
            textBody: $"Dear {name},\n\nWelcome! Your investor profile has been created.\nReference: {referenceNumber}");
    }

    public async Task SendPasswordResetAsync(string toEmail, string name, string resetToken)
    {
        var resetUrl = $"{_siteUrl}/auth/reset-password?token={Uri.EscapeDataString(resetToken)}";
        await SendAsync(toEmail, "Password Reset — OSC Digital Tool",
            htmlBody: EmailTemplates.PasswordReset(name, resetUrl),
            textBody: $"Dear {name},\n\nReset your password: {resetUrl}\n\nExpires in 1 hour.");
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
        string contactName, string contactEmail, string subject, string message)
    {
        await SendAsync(_adminEmail, $"New Inquiry {referenceNumber} for {agencyCode}",
            textBody: $"New inquiry via OSC portal.\n\nRef: {referenceNumber}\nAgency: {agencyName} ({agencyCode})\nFrom: {contactName} ({contactEmail})\nSubject: {subject}\n\nMessage:\n{message}\n\nReview: {_siteUrl}/dashboard");
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
        int durationMinutes, string meetingType)
    {
        await SendAsync(_adminEmail, $"Appointment Request {referenceNumber} for {agencyCode}",
            textBody: $"Appointment request via OSC portal.\n\nRef: {referenceNumber}\nAgency: {agencyName} ({agencyCode})\nContact: {contactName} ({contactEmail}, {contactPhone})\nService: {serviceType}\nPurpose: {purpose}\nDate: {date} at {time}\nDuration: {durationMinutes}min ({meetingType})\n\nReview: {_siteUrl}/dashboard");
    }

    private async Task SendAsync(string to, string subject, string? textBody = null, string? htmlBody = null)
    {
        if (_client is null)
        {
            _logger.LogWarning("Postmark not configured — email to {To} skipped: {Subject}", to, subject);
            return;
        }

        try
        {
            var message = new PostmarkMessage
            {
                From = _fromAddress,
                To = to,
                Subject = subject,
                TextBody = textBody,
                HtmlBody = htmlBody,
            };
            await _client.SendMessageAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Subject}", to, subject);
        }
    }
}
