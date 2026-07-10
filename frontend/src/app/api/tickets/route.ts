/**
 * Sanity-only fallback for ticket CRUD.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes /api/tickets to ASP.NET instead.
 * This route is only active in Sanity-only mode (no backend connected).
 */
import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import {
  TICKETS_ADMIN_QUERY,
  TICKETS_TOTAL_COUNT_QUERY,
  TICKET_COUNT_BY_YEAR_QUERY,
  TICKET_REF_EXISTS_QUERY,
} from '@/lib/sanity-queries';
import { apiSuccess, apiError, validateBody, validateSearchParams, sanitizeString } from '@/lib/api-utils';
import { createTicketSchema, paginationSchema, SLA_HOURS } from '@/lib/validations';
import { sendTicketConfirmationEmail, sendEscalationNotificationEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';
import { createRateLimiter, clientIp } from '@/lib/rate-limit';
import type { SanityTicket } from '@/types/sanity';

const ticketCreateLimiter = createRateLimiter(60_000, 10); // 10 tickets/minute/IP

export async function GET(request: NextRequest) {
  // Admin-only: returns the full ticket list with investor contact details.
  // Public users track a single ticket via GET /api/tickets/[id]?email=…
  const admin = await requireAdmin(request);
  if (!admin) return apiError('Admin access required', 401, 'UNAUTHORIZED');

  try {
    const [params, err] = validateSearchParams(request, paginationSchema);
    if (err) return err;

    const [tickets, total] = await Promise.all([
      client.fetch<SanityTicket[]>(TICKETS_ADMIN_QUERY, { from: params.from, to: params.to }),
      client.fetch<number>(TICKETS_TOTAL_COUNT_QUERY),
    ]);

    return apiSuccess(tickets, { total, from: params.from, to: params.to });
  } catch (error) {
    console.error('[GET /api/tickets]', error);
    return apiError('Failed to fetch tickets');
  }
}

// ── Reference number generation with collision retry ────────────────

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `UIA-${year}-*`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await getWriteClient().fetch<number>(TICKET_COUNT_BY_YEAR_QUERY, { pattern });
    const seq = count + 1 + attempt; // offset by attempt to avoid same collision
    const ref = `UIA-${year}-${String(seq).padStart(4, '0')}`;

    const exists = await getWriteClient().fetch<boolean>(TICKET_REF_EXISTS_QUERY, { ref });
    if (!exists) return ref;
  }

  // Fallback: timestamp-based to guarantee uniqueness
  const ts = Date.now().toString(36).toUpperCase();
  return `UIA-${new Date().getFullYear()}-T${ts}`;
}

export async function POST(request: NextRequest) {
  try {
    if (ticketCreateLimiter.isRateLimited(clientIp(request))) {
      return apiError('Too many requests. Please wait a moment before trying again.', 429, 'RATE_LIMITED');
    }

    const [data, err] = await validateBody(request, createTicketSchema);
    if (err) return err;

    const now = new Date();
    const isEscalated = data.isEscalated === true;

    // Escalated tickets get priority boost and tighter SLA
    const effectivePriority = isEscalated && data.priority === 'medium' ? 'high' : data.priority;
    const ESCALATION_SLA_HOURS = 4; // 4-hour SLA for escalated tickets
    const slaHours = isEscalated
      ? Math.min(SLA_HOURS[data.category] || 24, ESCALATION_SLA_HOURS)
      : (SLA_HOURS[data.category] || 24);
    const slaDeadlineAt = new Date(now.getTime() + slaHours * 3600000);

    const referenceNumber = await generateRefNumber();

    const ticket = await getWriteClient().create({
      _type: 'ticket',
      referenceNumber,
      title: sanitizeString(data.title),
      description: sanitizeString(data.description),
      category: data.category,
      priority: effectivePriority,
      status: 'NEW',
      contactName: sanitizeString(data.contactName),
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      investorNationality: data.investorNationality,
      sector: data.sector,
      investmentSize: data.investmentSize,
      slaDeadlineHours: slaHours,
      slaDeadlineAt: slaDeadlineAt.toISOString(),
      isEscalated,
      ...(isEscalated ? { escalatedAt: now.toISOString() } : {}),
      createdAt: now.toISOString(),
      ...(data.documents && data.documents.length > 0 ? { documents: data.documents } : {}),
    });

    // Send confirmation email (fire-and-forget)
    sendTicketConfirmationEmail({
      to: data.contactEmail,
      contactName: data.contactName,
      referenceNumber,
      title: data.title,
      category: data.category,
      slaHours,
    }).catch((err) => console.error('[POST /api/tickets] email failed:', err));

    // Notify admin/officers on escalation (fire-and-forget)
    if (isEscalated) {
      sendEscalationNotificationEmail({
        referenceNumber,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        title: data.title,
        description: data.description,
        priority: effectivePriority,
        slaHours,
      }).catch((err) => console.error('[POST /api/tickets] escalation email failed:', err));
    }

    return apiSuccess(
      { referenceNumber: ticket.referenceNumber as string, ticketId: ticket._id },
      undefined,
      201
    );
  } catch (error) {
    console.error('[POST /api/tickets]', error);
    return apiError('Failed to create ticket');
  }
}
