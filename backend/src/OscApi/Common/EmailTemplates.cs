namespace OscApi.Common;

/// <summary>
/// HTML templates for every outbound email. Inline styles throughout — email clients
/// strip &lt;style&gt; blocks and ignore most CSS selectors, so anything that must render
/// (Outlook, Gmail, mobile mail apps) has to be a table layout with inline attributes.
/// Colors match the site's brand tokens (see frontend/src/app/globals.css): black,
/// gold #FFD700, red #CE1126, white — not an approximation of them.
/// </summary>
public static class EmailTemplates
{
    private const string Gold = "#FFD700";
    private const string DarkGold = "#8A7200"; // readable gold-on-white for small text/links
    private const string Red = "#CE1126";
    private const string Black = "#000000";
    private const string Ink = "#1f2937";
    private const string InkMuted = "#586273";
    private const string SurfaceMuted = "#f6f7f8";
    private const string Green = "#15803d";
    private const string GreenBg = "#f0fdf4";

    private const string SupportEmail = "info@ugandainvest.go.ug";
    private const string SupportPhone = "+256 414 301 000";

    /// <summary>
    /// Wraps body content in the shared shell: a hidden preheader (the line inbox
    /// previews show before a reader opens the message), the brand header with the
    /// tricolour band used across the site, the content area, and a footer with real
    /// contact details so the message reads as an institution, not a no-reply bot.
    /// </summary>
    private static string Wrap(string preheader, string eyebrow, string title, string body) => $"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <title>{title}</title>
        </head>
        <body style="margin:0;padding:0;background:{SurfaceMuted};font-family:Arial,Helvetica,sans-serif;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:{SurfaceMuted};padding:32px 16px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;">
                  <tr>
                    <td style="font-size:0;line-height:0;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
                        <td width="33.33%" style="background:{Black};height:4px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="33.33%" style="background:{Gold};height:4px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="33.34%" style="background:{Red};height:4px;font-size:0;line-height:0;">&nbsp;</td>
                      </tr></table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:{Black};padding:24px 32px;">
                      <p style="margin:0;color:#ffffff;font-size:17px;font-weight:bold;letter-spacing:.01em;">OneStop Centre</p>
                      <p style="margin:3px 0 0;color:{Gold};font-size:11px;font-weight:bold;letter-spacing:.14em;text-transform:uppercase;">Uganda Investment Authority</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 32px 32px;">
                      <p style="margin:0 0 10px;color:{Red};font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;">{eyebrow}</p>
                      <h1 style="margin:0 0 18px;color:{Black};font-size:21px;line-height:1.3;">{title}</h1>
                      {body}
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e5e5e5;padding:22px 32px;">
                      <p style="margin:0 0 4px;color:{Ink};font-size:13px;font-weight:bold;">Need help with this?</p>
                      <p style="margin:0;color:{InkMuted};font-size:13px;line-height:1.6;">
                        Email <a href="mailto:{SupportEmail}" style="color:{DarkGold};text-decoration:underline;">{SupportEmail}</a>
                        or call {SupportPhone}, Monday–Friday, 8:00 AM–5:00 PM.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:{SurfaceMuted};padding:16px 32px;font-size:11px;color:#8a8a8a;">
                      <p style="margin:0;">Uganda Investment Authority — OneStop Centre, Plot 28 Kampala Road, Kampala</p>
                      <p style="margin:4px 0 0;">This is an automated message from a system that cannot receive replies. Use the contact above instead.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    private static string P(string text) => $"""<p style="margin:0 0 14px;color:{Ink};font-size:15px;line-height:1.65;">{text}</p>""";

    private static string Muted(string text) => $"""<p style="margin:14px 0 0;color:#9a9a9a;font-size:12px;line-height:1.6;">{text}</p>""";

    /// <summary>A left-rule info panel — the site's own convention for calling out a reference number or key facts.</summary>
    private static string InfoBox(string accent, string accentBg, string html) =>
        $"""<div style="background:{accentBg};border-left:4px solid {accent};padding:14px 18px;margin:0 0 20px;">{html}</div>""";

    private static string Button(string href, string label, string bg, string fg) =>
        $"""
        <p style="margin:26px 0 4px;">
          <a href="{href}" style="display:inline-block;background:{bg};color:{fg};padding:13px 28px;text-decoration:none;font-weight:bold;font-size:14px;">{label}</a>
        </p>
        """;

    private static string Sign() =>
        $"""<p style="margin:22px 0 0;color:{Ink};font-size:15px;line-height:1.65;">The OneStop Centre Team</p>""";

    // ---- Tickets ------------------------------------------------------------------

    public static string TicketConfirmation(string name, string refNumber, string title, string trackUrl) =>
        Wrap($"We've received your inquiry — reference {refNumber}.", "Support ticket", "Your inquiry has been received", $"""
            {P($"Dear {name},")}
            {P("Thank you for reaching out. Your inquiry has been logged and a member of the OneStop Centre team will review it shortly.")}
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;font-size:19px;font-weight:bold;color:{Black};">{refNumber}</p>
                <p style="margin:4px 0 0;color:{InkMuted};font-size:14px;">Subject: {title}</p>
                """)}
            {P("You can check progress at any time using the link below — no need to reply to this email.")}
            {Button(trackUrl, "Track your ticket", Black, Gold)}
            {Sign()}
            """);

    public static string TicketStatusUpdate(string name, string refNumber, string newStatus, string trackUrl) =>
        Wrap($"Ticket {refNumber} is now {newStatus}.", "Support ticket", "Your ticket has an update", $"""
            {P($"Dear {name},")}
            {P($"There's an update on your ticket <strong>{refNumber}</strong>:")}
            {InfoBox(Green, GreenBg, $"""<p style="margin:0;font-size:16px;font-weight:bold;color:{Black};">New status: {newStatus}</p>""")}
            {P("Open the link below for the full detail and, if the agency has asked a question, to reply.")}
            {Button(trackUrl, "View ticket details", Black, Gold)}
            {Sign()}
            """);

    public static string TicketReply(string name, string refNumber, string title, string reply, string trackUrl) =>
        Wrap($"The OneStop Centre replied on ticket {refNumber}.", "Support ticket", "You have a new reply", $"""
            {P($"Dear {name},")}
            {P($"The OneStop Centre has replied to your ticket <strong>{refNumber}</strong> ({Enc(title)}):")}
            {InfoBox(Gold, SurfaceMuted, $"""<p style="margin:0;color:{Ink};font-size:15px;line-height:1.6;white-space:pre-line;">{Enc(reply)}</p>""")}
            {P("Open your ticket to read the full conversation or reply.")}
            {Button(trackUrl, "View and reply", Black, Gold)}
            {Sign()}
            """);

    public static string TicketAccessLink(string name, string refNumber, string title, string trackUrl) =>
        Wrap($"Your private link to ticket {refNumber}.", "Support ticket", "Your ticket link", $"""
            {P($"Dear {name},")}
            {P($"Here is your private link to ticket <strong>{refNumber}</strong> ({Enc(title)}). Anyone with this link can view the ticket, so please don't share it.")}
            {Button(trackUrl, "Open your ticket", Black, Gold)}
            {Muted("If you didn't ask for this link, no action is needed.")}
            {Sign()}
            """);

    public static string TicketCommentNotification(string refNumber, string title, string contactName, string comment, string ticketUrl) =>
        Wrap($"{contactName} replied on ticket {refNumber}.", "Investor reply", "An investor replied", $"""
            {P($"<strong>{Enc(contactName)}</strong> replied on ticket <strong>{refNumber}</strong> ({Enc(title)}):")}
            {InfoBox(Gold, SurfaceMuted, $"""<p style="margin:0;color:{Ink};font-size:15px;line-height:1.6;white-space:pre-line;">{Enc(comment)}</p>""")}
            {Button(ticketUrl, "Open ticket", Black, Gold)}
            """);

    private static string Enc(string text) => System.Net.WebUtility.HtmlEncode(text);

    public static string EscalationNotification(string refNumber, string title, string contactName, string dashboardUrl, string? customMessage = null) =>
        Wrap($"Ticket {refNumber} was escalated by the investor.", "Escalation alert", "A ticket needs attention", $"""
            {P("An investor has escalated the ticket below. Escalations should be reviewed the same working day.")}
            {InfoBox(Red, "#fef2f2", $"""
                <p style="margin:0;font-weight:bold;color:{Black};">Reference: {refNumber}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Subject: {title}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Investor: {contactName}</p>
                """)}
            {(string.IsNullOrEmpty(customMessage) ? "" : P($"<em>\"{customMessage}\"</em>"))}
            {Button(dashboardUrl, "Open ticket", Red, "#ffffff")}
            """);

    // ---- Business registration (URSB) ----------------------------------------------

    public static string BusinessRegistrationReceived(string name, string refNumber, string businessName, string trackUrl) =>
        Wrap($"Registration for {businessName} is under review.", "Business registration · URSB", "Your registration has been received", $"""
            {P($"Dear {name},")}
            {P($"The Uganda Registration Services Bureau has received your business registration for <strong>{businessName}</strong>. A name-availability review is next.")}
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;font-size:19px;font-weight:bold;color:{Black};">{refNumber}</p>
                <p style="margin:4px 0 0;color:{InkMuted};font-size:14px;">Status: Received</p>
                """)}
            {P("We'll email you again as soon as the status changes, so there's nothing to check in the meantime unless you want to.")}
            {Button(trackUrl, "Track your registration", Black, Gold)}
            {Sign()}
            """);

    public static string BusinessRegistrationStatusUpdate(string name, string refNumber, string businessName, string newStatus, string trackUrl) =>
        Wrap($"{businessName} ({refNumber}) is now {newStatus}.", "Business registration · URSB", "Your registration status has changed", $"""
            {P($"Dear {name},")}
            {P($"Your registration for <strong>{businessName}</strong> ({refNumber}) has moved forward:")}
            {InfoBox(Green, GreenBg, $"""<p style="margin:0;font-size:16px;font-weight:bold;color:{Black};">New status: {newStatus}</p>""")}
            {Button(trackUrl, "View registration details", Black, Gold)}
            {Sign()}
            """);

    public static string BusinessRegistrationCertificateIssued(string name, string refNumber, string businessName, string certificateNumber, string certificateUrl) =>
        Wrap($"{businessName} is officially registered.", "Business registration · URSB", "Certificate of incorporation issued", $"""
            {P($"Dear {name},")}
            {P($"Congratulations — <strong>{businessName}</strong> is now formally registered with URSB. Your certificate of incorporation is ready.")}
            {InfoBox(Green, GreenBg, $"""
                <p style="margin:0;color:{InkMuted};font-size:13px;">Certificate number</p>
                <p style="margin:4px 0 0;font-size:19px;font-weight:bold;color:{Black};">{certificateNumber}</p>
                """)}
            {P("Download and keep a copy of your certificate — you'll need it for tax registration, banking, and most licences that follow.")}
            {Button(certificateUrl, "Download certificate", Black, Gold)}
            {Sign()}
            """);

    // ---- Investors & accounts ------------------------------------------------------

    public static string InvestorWelcome(string name, string refNumber) =>
        Wrap("Your investor profile is ready.", "Investor profile", "Welcome to Uganda Investment Authority", $"""
            {P($"Dear {name},")}
            {P("Your investor profile has been created. This reference number ties together every enquiry, registration, and ticket you raise with the OneStop Centre, so keep it somewhere you can find it.")}
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;color:{InkMuted};font-size:13px;">Your reference number</p>
                <p style="margin:4px 0 0;font-size:19px;font-weight:bold;color:{Black};">{refNumber}</p>
                """)}
            {P("From here you can explore investment opportunities, start a business registration, or get in touch with the agency relevant to your plans.")}
            {Sign()}
            """);

    public static string InvestorReferenceReminder(string name, string refNumber) =>
        Wrap("Your investor reference number.", "Investor profile", "You already have an investor profile", $"""
            {P($"Dear {name},")}
            {P("Someone — most likely you — just submitted the investor onboarding form with this email address. You already have an investor profile with us, so no new one was created.")}
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;color:{InkMuted};font-size:13px;">Your reference number</p>
                <p style="margin:4px 0 0;font-size:19px;font-weight:bold;color:{Black};">{refNumber}</p>
                """)}
            {P("Our investment team will be in touch. Quote this reference in any enquiry so we can find your profile quickly.")}
            {Muted("If you didn't submit the form, no action is needed — your profile hasn't changed.")}
            {Sign()}
            """);

    public static string PasswordReset(string name, string resetUrl) =>
        Wrap("Reset your OneStop Centre password.", "Account security", "Password reset requested", $"""
            {P($"Dear {name},")}
            {P("We received a request to reset the password on your account. Choose a new password using the button below.")}
            {Button(resetUrl, "Reset password", Black, Gold)}
            {Muted("This link expires in 1 hour. If you didn't request this, no action is needed — your password hasn't changed and you can ignore this email.")}
            """);

    public static string EmailVerification(string name, string verificationUrl) =>
        Wrap("Verify your OneStop Centre account email address.", "Account security", "Confirm your email address", $"""
            {P($"Dear {name},")}
            {P("Confirm that this is your email address, then choose the password for your account.")}
            {Button(verificationUrl, "Verify email and choose password", Black, Gold)}
            {Muted("This link expires in 24 hours. If you didn't create an account, you can ignore this email.")}
            """);

    // ---- Contact / general inquiries -------------------------------------------------

    public static string ContactConfirmation(string name, string refNumber, string agencyName, string subject) =>
        Wrap($"Your message to {agencyName} has been received.", "Agency inquiry", "Your inquiry has been received", $"""
            {P($"Dear {name},")}
            {P($"Your inquiry to <strong>{agencyName}</strong> has been received and logged for a response.")}
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;color:{InkMuted};font-size:14px;">Reference: <strong style="color:{Black};">{refNumber}</strong></p>
                <p style="margin:4px 0 0;color:{InkMuted};font-size:14px;">Subject: {subject}</p>
                """)}
            {P("The agency typically responds within 24–48 hours.")}
            {Sign()}
            """);

    public static string ContactNotificationToAgency(string agencyName, string agencyCode, string refNumber, string contactName, string contactEmail, string subject, string message, string dashboardUrl) =>
        Wrap($"New inquiry {refNumber} for {agencyCode}.", "New inquiry", "New investor inquiry", $"""
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;font-weight:bold;color:{Black};">Reference: {refNumber}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Agency: {agencyName} ({agencyCode})</p>
                <p style="margin:4px 0 0;color:{InkMuted};">From: {contactName} &lt;{contactEmail}&gt;</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Subject: {subject}</p>
                """)}
            {P(message)}
            {Button(dashboardUrl, "Respond in dashboard", Black, Gold)}
            """);

    // ---- Appointments ---------------------------------------------------------------

    public static string AppointmentConfirmation(string name, string refNumber, string agencyName, string date, string time) =>
        Wrap($"Appointment request with {agencyName} received.", "Appointment", "Your appointment request has been received", $"""
            {P($"Dear {name},")}
            {P($"Your appointment request with <strong>{agencyName}</strong> has been received.")}
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;color:{InkMuted};font-size:14px;">Reference: <strong style="color:{Black};">{refNumber}</strong></p>
                <p style="margin:4px 0 0;color:{InkMuted};font-size:14px;">Requested for: {date} at {time}</p>
                """)}
            {P("The agency will confirm this time or propose an alternative within 24 hours.")}
            {Sign()}
            """);

    public static string AppointmentNotificationToAgency(string agencyName, string agencyCode, string refNumber, string contactName, string contactEmail, string contactPhone, string serviceType, string purpose, string date, string time, int durationMinutes, string meetingType, string dashboardUrl) =>
        Wrap($"Appointment request {refNumber} for {agencyCode}.", "New appointment request", "New appointment request", $"""
            {InfoBox(Gold, SurfaceMuted, $"""
                <p style="margin:0;font-weight:bold;color:{Black};">Reference: {refNumber}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Agency: {agencyName} ({agencyCode})</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Contact: {contactName} &lt;{contactEmail}&gt;, {contactPhone}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Service: {serviceType}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">Purpose: {purpose}</p>
                <p style="margin:4px 0 0;color:{InkMuted};">When: {date} at {time} · {durationMinutes} min · {meetingType}</p>
                """)}
            {Button(dashboardUrl, "Respond in dashboard", Black, Gold)}
            """);
}
