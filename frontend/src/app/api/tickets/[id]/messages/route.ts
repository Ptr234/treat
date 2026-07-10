/**
 * Sanity-only fallback for ticket messages.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes to ASP.NET instead.
 */
import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { TICKET_BY_REFERENCE_QUERY, TICKET_MESSAGES_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, validateBody, sanitizeString } from '@/lib/api-utils';
import { ticketMessageSchema, publicCommentSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/auth';
import { createRateLimiter, clientIp } from '@/lib/rate-limit';
import type { SanityTicket, SanityTicketMessage } from '@/types/sanity';

const messagePostLimiter = createRateLimiter(60_000, 10); // 10 messages/minute/IP

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });
    if (!ticket) return apiError('Ticket not found', 404, 'NOT_FOUND');

    const admin = await requireAdmin(request);

    if (!admin) {
      const email = new URL(request.url).searchParams.get('email');
      if (!email || email.toLowerCase() !== ticket.contactEmail.toLowerCase()) {
        return apiError('Email verification required', 403, 'EMAIL_MISMATCH');
      }
    }

    const messages = await client.fetch<SanityTicketMessage[]>(TICKET_MESSAGES_QUERY, {
      ticketId: ticket._id,
    });
    const visibleMessages = admin ? messages : messages.filter((m) => !m.isInternal);

    return apiSuccess(visibleMessages);
  } catch (error) {
    console.error('[GET /api/tickets/[id]/messages]', error);
    return apiError('Failed to fetch messages');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (messagePostLimiter.isRateLimited(clientIp(request))) {
      return apiError('Too many requests. Please wait a moment before trying again.', 429, 'RATE_LIMITED');
    }

    const { id } = await params;
    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });
    if (!ticket) return apiError('Ticket not found', 404, 'NOT_FOUND');

    const admin = await requireAdmin(request);

    if (admin) {
      // Admin: full message schema (can set role, isInternal)
      const [data, err] = await validateBody(request, ticketMessageSchema);
      if (err) return err;

      const doc = await getWriteClient().create({
        _type: 'ticketMessage',
        ticket: { _type: 'reference', _ref: ticket._id },
        content: sanitizeString(data.content),
        authorName: sanitizeString(data.authorName),
        authorRole: data.authorRole,
        authorEmail: data.authorEmail,
        isInternal: data.isInternal,
        sentAt: new Date().toISOString(),
      });

      return apiSuccess({ _id: doc._id }, undefined, 201);
    }

    // Public user: simplified schema + email verification
    const [data, err] = await validateBody(request, publicCommentSchema);
    if (err) return err;

    if (data.authorEmail.toLowerCase() !== ticket.contactEmail.toLowerCase()) {
      return apiError('Email does not match ticket contact', 403, 'EMAIL_MISMATCH');
    }

    const doc = await getWriteClient().create({
      _type: 'ticketMessage',
      ticket: { _type: 'reference', _ref: ticket._id },
      content: sanitizeString(data.content),
      authorName: sanitizeString(data.authorName),
      authorRole: 'investor',
      authorEmail: data.authorEmail,
      isInternal: false,
      sentAt: new Date().toISOString(),
    });

    return apiSuccess({ _id: doc._id }, undefined, 201);
  } catch (error) {
    console.error('[POST /api/tickets/[id]/messages]', error);
    return apiError('Failed to create message');
  }
}
