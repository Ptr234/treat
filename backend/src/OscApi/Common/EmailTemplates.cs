namespace OscApi.Common;

public static class EmailTemplates
{
    private const string BrandColor = "#ca8a04";
    private const string DarkBg = "#1a1a1a";

    private static string Wrap(string title, string body) => $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:{DarkBg};font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
            <tr>
              <td style="background:{BrandColor};padding:24px 32px;">
                <h1 style="margin:0;color:#000;font-size:20px;">Uganda Investment Authority</h1>
                <p style="margin:4px 0 0;color:#000;font-size:13px;">One Stop Centre Digital Tool</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 16px;color:#111;font-size:18px;">{title}</h2>
                {body}
              </td>
            </tr>
            <tr>
              <td style="background:#f5f5f5;padding:16px 32px;font-size:12px;color:#666;">
                <p style="margin:0;">Uganda Investment Authority — One Stop Centre</p>
                <p style="margin:4px 0 0;">This is an automated message. Please do not reply directly.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    public static string TicketConfirmation(string name, string refNumber, string title, string trackUrl) =>
        Wrap("Your Inquiry Has Been Received", $"""
            <p style="color:#333;line-height:1.6;">Dear {name},</p>
            <p style="color:#333;line-height:1.6;">Your inquiry has been received and assigned reference number:</p>
            <div style="background:#f9f9f9;border-left:4px solid {BrandColor};padding:12px 16px;margin:16px 0;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#111;">{refNumber}</p>
              <p style="margin:4px 0 0;color:#555;">Subject: {title}</p>
            </div>
            <p style="margin:24px 0 0;">
              <a href="{trackUrl}" style="display:inline-block;background:{BrandColor};color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Track Your Ticket</a>
            </p>
            """);

    public static string TicketStatusUpdate(string name, string refNumber, string newStatus, string trackUrl) =>
        Wrap("Ticket Status Update", $"""
            <p style="color:#333;line-height:1.6;">Dear {name},</p>
            <p style="color:#333;line-height:1.6;">Your ticket <strong>{refNumber}</strong> has been updated:</p>
            <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;margin:16px 0;">
              <p style="margin:0;font-size:16px;font-weight:bold;color:#111;">New Status: {newStatus}</p>
            </div>
            <p style="margin:24px 0 0;">
              <a href="{trackUrl}" style="display:inline-block;background:{BrandColor};color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View Details</a>
            </p>
            """);

    public static string InvestorWelcome(string name, string refNumber) =>
        Wrap("Welcome to Uganda Investment Authority", $"""
            <p style="color:#333;line-height:1.6;">Dear {name},</p>
            <p style="color:#333;line-height:1.6;">Welcome! Your investor profile has been created.</p>
            <div style="background:#f9f9f9;border-left:4px solid {BrandColor};padding:12px 16px;margin:16px 0;">
              <p style="margin:0;color:#555;">Your Reference Number:</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#111;">{refNumber}</p>
            </div>
            <p style="color:#333;line-height:1.6;">Use this reference number to track all your interactions with UIA.</p>
            """);

    public static string PasswordReset(string name, string resetUrl) =>
        Wrap("Password Reset Request", $"""
            <p style="color:#333;line-height:1.6;">Dear {name},</p>
            <p style="color:#333;line-height:1.6;">A password reset has been requested for your account.</p>
            <p style="margin:24px 0;">
              <a href="{resetUrl}" style="display:inline-block;background:{BrandColor};color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
            </p>
            <p style="color:#999;font-size:13px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
            """);

    public static string ContactConfirmation(string name, string refNumber, string agencyName, string subject) =>
        Wrap($"Inquiry Received — {agencyName}", $"""
            <p style="color:#333;line-height:1.6;">Dear {name},</p>
            <p style="color:#333;line-height:1.6;">Your inquiry to <strong>{agencyName}</strong> has been received.</p>
            <div style="background:#f9f9f9;border-left:4px solid {BrandColor};padding:12px 16px;margin:16px 0;">
              <p style="margin:0;color:#555;">Reference: <strong>{refNumber}</strong></p>
              <p style="margin:4px 0 0;color:#555;">Subject: {subject}</p>
            </div>
            <p style="color:#333;line-height:1.6;">The agency will respond within 24-48 hours.</p>
            """);

    public static string AppointmentConfirmation(string name, string refNumber, string agencyName, string date, string time) =>
        Wrap($"Appointment Request — {agencyName}", $"""
            <p style="color:#333;line-height:1.6;">Dear {name},</p>
            <p style="color:#333;line-height:1.6;">Your appointment request with <strong>{agencyName}</strong> has been received.</p>
            <div style="background:#f9f9f9;border-left:4px solid {BrandColor};padding:12px 16px;margin:16px 0;">
              <p style="margin:0;color:#555;">Reference: <strong>{refNumber}</strong></p>
              <p style="margin:4px 0 0;color:#555;">Date: {date} at {time}</p>
            </div>
            <p style="color:#333;line-height:1.6;">The agency will confirm or propose an alternative within 24 hours.</p>
            """);

    public static string EscalationNotification(string refNumber, string title, string contactName, string dashboardUrl) =>
        Wrap("Ticket Escalation Alert", $"""
            <p style="color:#333;line-height:1.6;">A ticket has been escalated by the investor.</p>
            <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;margin:16px 0;">
              <p style="margin:0;font-weight:bold;color:#111;">Reference: {refNumber}</p>
              <p style="margin:4px 0 0;color:#555;">Subject: {title}</p>
              <p style="margin:4px 0 0;color:#555;">Investor: {contactName}</p>
            </div>
            <p style="margin:24px 0 0;">
              <a href="{dashboardUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Review Now</a>
            </p>
            """);
}
