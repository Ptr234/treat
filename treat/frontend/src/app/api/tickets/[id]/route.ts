import { NextRequest } from 'next/server';
import { client, serverClient } from '@/lib/sanity-client';
import { TICKET_BY_REFERENCE_QUERY, TICKET_MESSAGES_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, validateBody } from '@/lib/api-utils';
import { ticketUpdateSchema } from '@/lib/validations';
import type { SanityTicket, SanityTicketMessage } from '@/types/sanity';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });

    if (!ticket) {
      return apiError('Ticket not found', 404, 'NOT_FOUND');
    }

    const messages = await client.fetch<SanityTicketMessage[]>(TICKET_MESSAGES_QUERY, {
      ticketId: ticket._id,
    });

    return apiSuccess({ ...ticket, messages });
  } catch (error) {
    console.error('[GET /api/tickets/[id]]', error);
    return apiError('Failed to fetch ticket');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [data, err] = await validateBody(request, ticketUpdateSchema);
    if (err) return err;

    // Verify ticket exists
    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });
    if (!ticket) {
      return apiError('Ticket not found', 404, 'NOT_FOUND');
    }

    // Build patch
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.priority !== undefined) patch.priority = data.priority;
    if (data.assignee !== undefined) patch.assignee = data.assignee;
    if (data.isEscalated !== undefined) patch.isEscalated = data.isEscalated;
    if (data.satisfactionRating !== undefined) patch.satisfactionRating = data.satisfactionRating;
    if (data.satisfactionComment !== undefined) patch.satisfactionComment = data.satisfactionComment;
    if (data.assignedAgency !== undefined) {
      patch.assignedAgency = { _type: 'reference', _ref: data.assignedAgency };
    }

    // Auto-set timestamps on status transitions
    const now = new Date().toISOString();
    if (data.status === 'RESOLVED') patch.resolvedAt = now;
    if (data.status === 'CLOSED') patch.closedAt = now;

    const updated = await serverClient.patch(ticket._id).set(patch).commit();

    return apiSuccess({ _id: updated._id, ...patch });
  } catch (error) {
    console.error('[PATCH /api/tickets/[id]]', error);
    return apiError('Failed to update ticket');
  }
}
