import { NextRequest } from 'next/server';
import { client, serverClient } from '@/lib/sanity-client';
import { TICKET_BY_REFERENCE_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, validateBody, sanitizeString } from '@/lib/api-utils';
import { ticketMessageSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/auth';
import type { SanityTicket } from '@/types/sanity';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [data, err] = await validateBody(request, ticketMessageSchema);
    if (err) return err;

    // Verify ticket exists
    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });
    if (!ticket) {
      return apiError('Ticket not found', 404, 'NOT_FOUND');
    }

    // Determine author role and internal flag based on authentication
    const admin = await requireAdmin(request);
    const authorRole = admin ? 'officer' : 'investor';
    const isInternal = admin ? (data.isInternal === true) : false;

    const message = await serverClient.create({
      _type: 'ticketMessage',
      ticket: { _type: 'reference', _ref: ticket._id },
      content: sanitizeString(data.content),
      authorName: admin ? admin.name : sanitizeString(data.authorName),
      authorRole,
      authorEmail: admin ? admin.email : data.authorEmail,
      isInternal,
      sentAt: new Date().toISOString(),
    });

    return apiSuccess({ _id: message._id, sentAt: message.sentAt }, undefined, 201);
  } catch (error) {
    console.error('[POST /api/tickets/[id]/messages]', error);
    return apiError('Failed to create message');
  }
}
