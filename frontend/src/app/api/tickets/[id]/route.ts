/**
 * Sanity-only fallback for ticket detail/update.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes to ASP.NET instead.
 */
import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { TICKET_BY_REFERENCE_QUERY, TICKET_MESSAGES_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, validateBody } from '@/lib/api-utils';
import { ticketUpdateSchema, publicTicketUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/auth';
import { sendTicketStatusEmail, sendEscalationNotificationEmail } from '@/lib/email';
import type { SanityTicket, SanityTicketMessage } from '@/types/sanity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });

    if (!ticket) {
      return apiError('Ticket not found', 404, 'NOT_FOUND');
    }

    // Check if requester is admin
    const admin = await requireAdmin(request);

    // Public access: require email query param to match ticket contactEmail
    if (!admin) {
      const email = new URL(request.url).searchParams.get('email');
      if (!email || email.toLowerCase() !== ticket.contactEmail.toLowerCase()) {
        return apiError(
          'Email verification required. Provide ?email= matching the ticket contact email.',
          403,
          'EMAIL_MISMATCH'
        );
      }
    }

    const messages = await client.fetch<SanityTicketMessage[]>(TICKET_MESSAGES_QUERY, {
      ticketId: ticket._id,
    });

    // Filter out internal messages for non-admin users
    const visibleMessages = admin
      ? messages
      : messages.filter((m) => !m.isInternal);

    return apiSuccess({ ...ticket, messages: visibleMessages });
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
    const admin = await requireAdmin(request);

    // --- Public user path: email-verified escalation/rating only ---
    if (!admin) {
      const [pubData, pubErr] = await validateBody(request, publicTicketUpdateSchema);
      if (pubErr) return pubErr;

      const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });
      if (!ticket) return apiError('Ticket not found', 404, 'NOT_FOUND');

      if (pubData.email.toLowerCase() !== ticket.contactEmail.toLowerCase()) {
        return apiError('Email verification failed', 403, 'EMAIL_MISMATCH');
      }

      const pubPatch: Record<string, unknown> = {};
      if (pubData.isEscalated && !ticket.isEscalated) {
        pubPatch.isEscalated = true;
        pubPatch.escalatedAt = new Date().toISOString();
        // Boost priority if still medium
        if (ticket.priority === 'medium' || ticket.priority === 'low') {
          pubPatch.priority = 'high';
        }
      }
      if (pubData.satisfactionRating !== undefined) pubPatch.satisfactionRating = pubData.satisfactionRating;
      if (pubData.satisfactionComment !== undefined) pubPatch.satisfactionComment = pubData.satisfactionComment;

      await getWriteClient().patch(ticket._id).set(pubPatch).commit();

      // Notify admins of escalation (fire-and-forget)
      if (pubPatch.isEscalated) {
        sendEscalationNotificationEmail({
          referenceNumber: ticket.referenceNumber,
          contactName: ticket.contactName,
          contactEmail: ticket.contactEmail,
          title: ticket.title,
          description: ticket.description,
          priority: (pubPatch.priority as string) || ticket.priority,
          slaHours: ticket.slaDeadlineHours ?? 4,
        }).catch((err) => console.error('[PATCH /api/tickets] escalation email failed:', err));
      }

      return apiSuccess({ _id: ticket._id, ...pubPatch });
    }

    // --- Admin path: full update capability ---
    const [data, err] = await validateBody(request, ticketUpdateSchema);
    if (err) return err;

    const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: id });
    if (!ticket) {
      return apiError('Ticket not found', 404, 'NOT_FOUND');
    }

    // Build patch
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.priority !== undefined) patch.priority = data.priority;
    if (data.assignee !== undefined) patch.assignee = data.assignee;
    if (data.isEscalated !== undefined) {
      patch.isEscalated = data.isEscalated;
      if (data.isEscalated && !ticket.isEscalated) {
        patch.escalatedAt = new Date().toISOString();
      }
    }
    if (data.satisfactionRating !== undefined) patch.satisfactionRating = data.satisfactionRating;
    if (data.satisfactionComment !== undefined) patch.satisfactionComment = data.satisfactionComment;
    if (data.assignedAgency !== undefined) {
      patch.assignedAgency = { _type: 'reference', _ref: data.assignedAgency };
    }

    // Auto-set timestamps on status transitions
    const now = new Date().toISOString();
    if (data.status === 'RESOLVED') patch.resolvedAt = now;
    if (data.status === 'CLOSED') patch.closedAt = now;

    const updated = await getWriteClient().patch(ticket._id).set(patch).commit();

    // Send email notification on status changes (fire-and-forget)
    if (data.status && data.status !== ticket.status) {
      sendTicketStatusEmail({
        to: ticket.contactEmail,
        contactName: ticket.contactName,
        referenceNumber: ticket.referenceNumber,
        title: ticket.title,
        newStatus: data.status,
      }).catch((emailErr) => console.error('[PATCH /api/tickets] email failed:', emailErr));
    }

    return apiSuccess({ _id: updated._id, ...patch });
  } catch (error) {
    console.error('[PATCH /api/tickets/[id]]', error);
    return apiError('Failed to update ticket');
  }
}
