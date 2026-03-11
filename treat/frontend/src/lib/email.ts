import * as postmark from 'postmark';

// Lazy-init Postmark client (no crash if POSTMARK_SERVER_TOKEN is missing)
let client: postmark.ServerClient | null = null;
function getPostmark(): postmark.ServerClient | null {
  if (!process.env.POSTMARK_SERVER_TOKEN) return null;
  if (!client) client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
  return client;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'notifications@onestopcentre.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://frontend-beast4.vercel.app';

// ── Status labels for emails ─────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Received',
  ASSIGNED: 'Assigned to Agency',
  IN_PROGRESS: 'In Progress',
  PENDING_EXTERNAL: 'Pending External Response',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

// ── Ticket confirmation email (on creation) ──────────────────────────

export async function sendTicketConfirmationEmail(opts: {
  to: string;
  contactName: string;
  referenceNumber: string;
  title: string;
  category: string;
  slaHours: number;
}) {
  const pm = getPostmark();
  if (!pm) {
    console.warn('[email] POSTMARK_SERVER_TOKEN not set — skipping ticket confirmation email');
    return;
  }

  const trackingUrl = `${SITE_URL}/tickets/${opts.referenceNumber}?email=${encodeURIComponent(opts.to)}`;

  await pm.sendEmail({
    From: FROM_ADDRESS,
    To: opts.to,
    Subject: `Inquiry Received — ${opts.referenceNumber}`,
    HtmlBody: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 24px; text-align: center;">
          <h1 style="color: #facc15; margin: 0; font-size: 20px;">Uganda Investment Authority</h1>
          <p style="color: #999; margin: 4px 0 0; font-size: 13px;">OneStop Centre</p>
        </div>
        <div style="padding: 24px; background: #fff;">
          <p>Dear ${opts.contactName},</p>
          <p>Your inquiry has been received and logged in our system.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 12px; background: #f9f9f9; font-weight: 600; width: 40%;">Reference</td>
              <td style="padding: 8px 12px; background: #f9f9f9;">${opts.referenceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600;">Subject</td>
              <td style="padding: 8px 12px;">${opts.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f9f9f9; font-weight: 600;">Category</td>
              <td style="padding: 8px 12px; background: #f9f9f9;">${opts.category.replace(/_/g, ' ')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600;">Expected Response</td>
              <td style="padding: 8px 12px;">Within ${opts.slaHours} hours</td>
            </tr>
          </table>
          <p>
            <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #facc15; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Track Your Inquiry
            </a>
          </p>
          <p style="color: #666; font-size: 13px; margin-top: 24px;">
            If you did not submit this inquiry, please disregard this email.
          </p>
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999;">
          Uganda Investment Authority &bull; Plot 22 Jinja Road, Kampala<br/>
          +256-414-301000 &bull; info@ugandainvest.go.ug
        </div>
      </div>
    `,
    MessageStream: 'outbound',
  });
}

// ── Ticket status change email ───────────────────────────────────────

export async function sendTicketStatusEmail(opts: {
  to: string;
  contactName: string;
  referenceNumber: string;
  title: string;
  newStatus: string;
}) {
  const pm = getPostmark();
  if (!pm) {
    console.warn('[email] POSTMARK_SERVER_TOKEN not set — skipping status email');
    return;
  }

  const statusLabel = STATUS_LABELS[opts.newStatus] || opts.newStatus;
  const trackingUrl = `${SITE_URL}/tickets/${opts.referenceNumber}?email=${encodeURIComponent(opts.to)}`;
  const isResolved = opts.newStatus === 'RESOLVED' || opts.newStatus === 'CLOSED';

  await pm.sendEmail({
    From: FROM_ADDRESS,
    To: opts.to,
    Subject: `${opts.referenceNumber} — Status Update: ${statusLabel}`,
    HtmlBody: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 24px; text-align: center;">
          <h1 style="color: #facc15; margin: 0; font-size: 20px;">Uganda Investment Authority</h1>
          <p style="color: #999; margin: 4px 0 0; font-size: 13px;">OneStop Centre</p>
        </div>
        <div style="padding: 24px; background: #fff;">
          <p>Dear ${opts.contactName},</p>
          <p>Your inquiry <strong>${opts.referenceNumber}</strong> has been updated:</p>
          <div style="background: ${isResolved ? '#f0fdf4' : '#fffbeb'}; border-left: 4px solid ${isResolved ? '#22c55e' : '#eab308'}; padding: 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${statusLabel}</p>
            <p style="margin: 4px 0 0; color: #666;">${opts.title}</p>
          </div>
          ${isResolved ? '<p>If your issue has been resolved to your satisfaction, we appreciate your feedback. You can rate your experience using the link below.</p>' : '<p>Our team is working on your inquiry. You will receive updates as progress is made.</p>'}
          <p>
            <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #facc15; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Details
            </a>
          </p>
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999;">
          Uganda Investment Authority &bull; Plot 22 Jinja Road, Kampala<br/>
          +256-414-301000 &bull; info@ugandainvest.go.ug
        </div>
      </div>
    `,
    MessageStream: 'outbound',
  });
}

// ── Investor welcome email (on onboarding) ───────────────────────────

export async function sendInvestorWelcomeEmail(opts: {
  to: string;
  name: string;
  referenceNumber: string;
  primarySector: string;
  investmentAmount: string;
}) {
  const pm = getPostmark();
  if (!pm) {
    console.warn('[email] POSTMARK_SERVER_TOKEN not set — skipping investor welcome email');
    return;
  }

  await pm.sendEmail({
    From: FROM_ADDRESS,
    To: opts.to,
    Subject: `Welcome to UIA OneStop Centre — ${opts.referenceNumber}`,
    HtmlBody: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 24px; text-align: center;">
          <h1 style="color: #facc15; margin: 0; font-size: 20px;">Uganda Investment Authority</h1>
          <p style="color: #999; margin: 4px 0 0; font-size: 13px;">OneStop Centre</p>
        </div>
        <div style="padding: 24px; background: #fff;">
          <p>Dear ${opts.name},</p>
          <p>Thank you for your interest in investing in Uganda! Your investor profile has been created.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 12px; background: #f9f9f9; font-weight: 600; width: 40%;">Investor Reference</td>
              <td style="padding: 8px 12px; background: #f9f9f9;">${opts.referenceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600;">Primary Sector</td>
              <td style="padding: 8px 12px;">${opts.primarySector}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f9f9f9; font-weight: 600;">Investment Range</td>
              <td style="padding: 8px 12px; background: #f9f9f9;">USD ${opts.investmentAmount}</td>
            </tr>
          </table>
          <p><strong>What happens next?</strong></p>
          <ol>
            <li>Our investment team will review your profile within 24 hours</li>
            <li>A dedicated officer will contact you to discuss opportunities</li>
            <li>You will receive a personalized investment facilitation plan</li>
          </ol>
          <p>In the meantime, explore investment opportunities and tools on our portal:</p>
          <p>
            <a href="${SITE_URL}/investments" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #facc15; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Explore Investments
            </a>
          </p>
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999;">
          Uganda Investment Authority &bull; Plot 22 Jinja Road, Kampala<br/>
          +256-414-301000 &bull; info@ugandainvest.go.ug
        </div>
      </div>
    `,
    MessageStream: 'outbound',
  });
}
