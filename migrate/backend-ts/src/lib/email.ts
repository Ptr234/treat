import type { Env } from '../types';

/**
 * Mirrors backend/src/OscApi/Common/EmailService.cs's SendAsync (Resend REST
 * API, from/to/subject/html/text) — only the password-reset template is
 * ported so far, since that's all the Auth+Me slice needs. Port the rest
 * (ticket confirmation, investor welcome, escalation, contact/appointment
 * notifications) alongside the Tickets/Investors/Contact slices instead of
 * speculatively duplicating templates nothing calls yet.
 */
async function sendEmail(
  env: Env,
  opts: { to: string; subject: string; html?: string; text?: string }
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${opts.subject}" to ${opts.to}`);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@oscdigitaltool.com',
        to: [opts.to],
        subject: opts.subject,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.text ? { text: opts.text } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend API error sending to ${opts.to}: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error(`[email] failed to send to ${opts.to}`, err);
  }
}

export async function sendPasswordResetEmail(
  env: Env,
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${env.SITE_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
  await sendEmail(env, {
    to,
    subject: 'Password Reset — OSC Digital Tool',
    text: `Dear ${name},\n\nReset your password: ${resetUrl}\n\nExpires in 1 hour.`,
  });
}

// ── Tickets slice — text bodies only (matching EmailService.cs's textBody
// fallback exactly); the HTML EmailTemplates.cs renders are cosmetic and not
// ported yet, so as not to duplicate template maintenance speculatively. ──

export async function sendTicketConfirmationEmail(
  env: Env,
  opts: { to: string; contactName: string; referenceNumber: string; title: string }
): Promise<void> {
  const trackUrl = `${env.SITE_URL}/tickets/${opts.referenceNumber}?email=${encodeURIComponent(opts.to)}`;
  await sendEmail(env, {
    to: opts.to,
    subject: `Ticket ${opts.referenceNumber} Received`,
    text: `Dear ${opts.contactName},\n\nYour inquiry has been received.\nReference: ${opts.referenceNumber}\nSubject: ${opts.title}\nTrack: ${trackUrl}`,
  });
}

export async function sendTicketStatusUpdateEmail(
  env: Env,
  opts: { to: string; contactName: string; referenceNumber: string; newStatus: string }
): Promise<void> {
  const trackUrl = `${env.SITE_URL}/tickets/${opts.referenceNumber}?email=${encodeURIComponent(opts.to)}`;
  await sendEmail(env, {
    to: opts.to,
    subject: `Ticket ${opts.referenceNumber} — Status Update`,
    text: `Dear ${opts.contactName},\n\nTicket ${opts.referenceNumber} updated to: ${opts.newStatus}\nView: ${trackUrl}`,
  });
}

export async function sendEscalationNotificationEmail(
  env: Env,
  opts: {
    referenceNumber: string; title: string; contactName: string;
    additionalRecipients?: string[]; customMessage?: string | null;
  }
): Promise<void> {
  const dashboardUrl = `${env.SITE_URL}/dashboard`;
  const subject = `ESCALATION: Ticket ${opts.referenceNumber}`;
  const text = `Ticket escalated.\nRef: ${opts.referenceNumber}\nSubject: ${opts.title}\nInvestor: ${opts.contactName}\n${opts.customMessage ?? ''}\nReview: ${dashboardUrl}`;

  const adminEmail = env.RESEND_ADMIN_EMAIL || 'notifications@oscdigitaltool.com';
  const recipients = new Set<string>([adminEmail]);
  for (const r of opts.additionalRecipients ?? []) {
    if (r && r !== adminEmail) recipients.add(r);
  }

  await Promise.all([...recipients].map((to) => sendEmail(env, { to, subject, text })));
}
