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
        await SendAsync(toEmail, $"Ticket {referenceNumber} Received",
            $"""
            Dear {contactName},

            Your inquiry has been received and assigned reference number {referenceNumber}.

            Subject: {title}

            Track your ticket at: {_siteUrl}/tickets/{referenceNumber}?email={Uri.EscapeDataString(toEmail)}

            Regards,
            Uganda Investment Authority — One Stop Centre
            """);
    }

    public async Task SendTicketStatusUpdateAsync(string toEmail, string contactName, string referenceNumber, string newStatus)
    {
        await SendAsync(toEmail, $"Ticket {referenceNumber} — Status Update",
            $"""
            Dear {contactName},

            Your ticket {referenceNumber} has been updated to: {newStatus}

            View details: {_siteUrl}/tickets/{referenceNumber}?email={Uri.EscapeDataString(toEmail)}

            Regards,
            Uganda Investment Authority — One Stop Centre
            """);
    }

    public async Task SendEscalationNotificationAsync(string referenceNumber, string title, string contactName)
    {
        await SendAsync(_adminEmail, $"ESCALATION: Ticket {referenceNumber}",
            $"""
            A ticket has been escalated by the investor.

            Reference: {referenceNumber}
            Subject: {title}
            Investor: {contactName}

            Review: {_siteUrl}/dashboard
            """);
    }

    public async Task SendInvestorWelcomeAsync(string toEmail, string name, string referenceNumber)
    {
        await SendAsync(toEmail, "Welcome to Uganda Investment Authority",
            $"""
            Dear {name},

            Welcome! Your investor profile has been created.

            Reference Number: {referenceNumber}

            You can use this reference number to track your interactions with UIA.

            Regards,
            Uganda Investment Authority — One Stop Centre
            """);
    }

    private async Task SendAsync(string to, string subject, string textBody)
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
            };
            await _client.SendMessageAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Subject}", to, subject);
        }
    }
}
