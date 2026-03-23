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

    public async Task SendPasswordResetAsync(string toEmail, string name, string resetToken)
    {
        await SendAsync(toEmail, "Password Reset — OSC Digital Tool",
            $"""
            Dear {name},

            A password reset has been requested for your account.

            Reset Token: {resetToken}

            Reset your password at: {_siteUrl}/auth/reset-password?token={Uri.EscapeDataString(resetToken)}

            This link expires in 1 hour. If you did not request this, ignore this email.

            Regards,
            Uganda Investment Authority — One Stop Centre
            """);
    }

    public async Task SendContactConfirmationAsync(
        string toEmail, string name, string referenceNumber, string agencyName, string subject)
    {
        await SendAsync(toEmail, $"Inquiry {referenceNumber} Received — {agencyName}",
            $"""
            Dear {name},

            Your inquiry to {agencyName} has been received.

            Reference Number: {referenceNumber}
            Subject: {subject}

            The agency will respond within 24-48 hours. You can track your inquiry using the reference number above.

            Regards,
            Uganda Investment Authority — One Stop Centre
            """);
    }

    public async Task SendContactNotificationToAgencyAsync(
        string agencyCode, string agencyName, string referenceNumber,
        string contactName, string contactEmail, string subject, string message)
    {
        await SendAsync(_adminEmail, $"New Inquiry {referenceNumber} for {agencyCode}",
            $"""
            A new inquiry has been submitted via the OneStop Centre portal.

            Reference: {referenceNumber}
            Agency: {agencyName} ({agencyCode})
            From: {contactName} ({contactEmail})
            Subject: {subject}

            Message:
            {message}

            Review at: {_siteUrl}/dashboard
            """);
    }

    public async Task SendAppointmentConfirmationAsync(
        string toEmail, string name, string referenceNumber,
        string agencyName, string date, string time)
    {
        await SendAsync(toEmail, $"Appointment Request {referenceNumber} — {agencyName}",
            $"""
            Dear {name},

            Your appointment request with {agencyName} has been received.

            Reference Number: {referenceNumber}
            Preferred Date: {date}
            Preferred Time: {time}

            The agency will confirm or propose an alternative within 24 hours.

            Regards,
            Uganda Investment Authority — One Stop Centre
            """);
    }

    public async Task SendAppointmentNotificationToAgencyAsync(
        string agencyCode, string agencyName, string referenceNumber,
        string contactName, string contactEmail, string contactPhone,
        string serviceType, string purpose, string date, string time,
        int durationMinutes, string meetingType)
    {
        await SendAsync(_adminEmail, $"Appointment Request {referenceNumber} for {agencyCode}",
            $"""
            A new appointment request has been submitted via the OneStop Centre portal.

            Reference: {referenceNumber}
            Agency: {agencyName} ({agencyCode})

            Contact:
            - Name: {contactName}
            - Email: {contactEmail}
            - Phone: {contactPhone}

            Service: {serviceType}
            Purpose: {purpose}
            Date: {date} at {time}
            Duration: {durationMinutes} minutes
            Type: {meetingType}

            Review at: {_siteUrl}/dashboard
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
