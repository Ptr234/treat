'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  StarIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { apiFetch, resolveApiUrl } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeStatus, normalizePriority, normalizeCategory, normalizeAuthorRole } from '@/lib/ticket-format';
import type { TicketStatus, TicketPriority } from '@/types';

// --- Types matching the ASP.NET ticket response ---

interface TicketMessage {
  id: string;
  content: string;
  authorName: string;
  authorRole: 'investor' | 'officer' | 'system';
  isInternal?: boolean;
  sentAt: string;
}

interface TicketData {
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  assignee?: string;
  assignedAgencyCode?: string;
  slaDeadlineAt?: string;
  satisfactionRating?: number;
  isEscalated: boolean;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
  messages: TicketMessage[];
}

interface Agency {
  code: string;
  name: string;
}

// --- Label & color maps ---

const categoryLabels: Record<string, string> = {
  general_inquiry: 'General Inquiry',
  procedure_query: 'Procedure Query',
  application_support: 'Application Support',
  license_delay: 'License Delay',
  complaint: 'Complaint',
  vip: 'VIP Investor',
};

const statusLabels: Record<TicketStatus, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_EXTERNAL: 'Pending External',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

// UI status → the value the API accepts.
const statusApiValues: Record<TicketStatus, string> = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING_EXTERNAL: 'pending_external',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const priorityColors: Record<string, string> = {
  low: 'gov-tag gov-tag--grey',
  medium: 'gov-tag gov-tag--outline',
  high: 'gov-tag gov-tag--gold',
  critical: 'gov-tag gov-tag--red',
};

const statusColors: Record<string, string> = {
  NEW: 'gov-tag gov-tag--red',
  ASSIGNED: 'gov-tag gov-tag--outline',
  IN_PROGRESS: 'gov-tag gov-tag--gold',
  PENDING_EXTERNAL: 'gov-tag gov-tag--grey',
  RESOLVED: 'gov-tag',
  CLOSED: 'gov-tag gov-tag--grey',
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function Notice({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={`mb-4 border-l-4 py-2 pl-4 text-sm ${
        kind === 'error' ? 'border-[#ce1126] font-semibold text-[#9a0d1c]' : 'border-black text-black'
      }`}
    >
      {children}
    </p>
  );
}

// --- Component ---

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The private token from the tracking link (or the create page's redirect).
  const token = searchParams.get('token');
  // Links in emails sent before tracking tokens carried the address instead;
  // it no longer grants access but pre-fills the "send me a new link" form.
  const legacyEmail = searchParams.get('email');
  const justCreated = searchParams.get('created') === '1';
  const uploadFailed = searchParams.get('uploadFailed') === '1';

  // Staff read via session; the filer via the token, or by being signed in
  // under the email the ticket was filed with.
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const isStaff = isAuthenticated && ['admin', 'dg', 'agency_officer'].includes(user?.role ?? '');

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsLink, setNeedsLink] = useState(false);

  const [comment, setComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentNotice, setCommentNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationError, setEscalationError] = useState<string | null>(null);

  // --- Data fetching ---

  const fetchTicket = useCallback(async () => {
    setLoadError(null);
    try {
      const query = !isStaff && token ? `?token=${encodeURIComponent(token)}` : '';
      const json = await apiFetch<TicketData>(`/api/tickets/${ticketId}${query}`);

      if (!json.success || !json.data) {
        if (isStaff) setLoadError(json.error || 'Failed to load ticket');
        else setNeedsLink(true); // the API answers "not found" for both missing and not-yours
        return;
      }

      // Normalize backend enum casing so status/priority/category comparisons,
      // labels, colours and the isResolved gate all work.
      const raw = json.data;
      setTicket({
        ...raw,
        status: normalizeStatus(raw.status),
        priority: normalizePriority(raw.priority),
        category: normalizeCategory(raw.category),
        messages: (raw.messages ?? []).map((m) => ({ ...m, authorRole: normalizeAuthorRole(m.authorRole) })),
      });
      setRating(raw.satisfactionRating || 0);
      setNeedsLink(false);
    } catch {
      setLoadError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [ticketId, isStaff, token]);

  useEffect(() => {
    // Wait for the session to resolve so we don't flash the link form at staff.
    if (authLoading) return;
    if (isStaff || token || isAuthenticated) {
      fetchTicket();
    } else {
      setNeedsLink(true);
      setLoading(false);
    }
  }, [authLoading, isStaff, token, isAuthenticated, fetchTicket]);

  // --- Handlers ---

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !ticket) return;

    setIsSubmittingComment(true);
    setCommentNotice(null);
    try {
      // Staff post to the authenticated officer endpoint (role/identity from the
      // session); the filer posts to the ownership-checked comments endpoint.
      const res = isStaff
        ? await apiFetch(`/api/tickets/${ticketId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content: comment.trim(), isInternal: isInternalNote }),
          })
        : await apiFetch(`/api/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content: comment.trim(), token }),
          });
      if (!res.success) {
        setCommentNotice({ kind: 'error', text: res.error || 'Your message could not be sent. Please try again.' });
        return;
      }
      setComment('');
      setIsInternalNote(false);
      setCommentNotice({
        kind: 'success',
        text: isStaff && !isInternalNote ? 'Reply sent — the investor has been emailed.' : 'Message added.',
      });
      fetchTicket();
    } catch {
      setCommentNotice({ kind: 'error', text: 'Network error — your message was not sent.' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRatingSubmit = async (newRating: number) => {
    if (!ticket || isStaff) return; // only the investor rates their own service
    setIsSubmittingRating(true);
    setRatingError(null);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/public`, {
        method: 'PATCH',
        body: JSON.stringify({ token, satisfactionRating: newRating }),
      });
      if (res.success) setRating(newRating);
      else setRatingError(res.error || 'Your rating could not be saved.');
    } catch {
      setRatingError('Network error — your rating was not saved.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleEscalation = async () => {
    if (!ticket || ticket.isEscalated) return;
    setIsEscalating(true);
    setEscalationError(null);
    try {
      const res = isStaff
        ? await apiFetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isEscalated: true }),
          })
        : await apiFetch(`/api/tickets/${ticketId}/public`, {
            method: 'PATCH',
            body: JSON.stringify({ token, isEscalated: true }),
          });
      if (res.success) fetchTicket();
      else setEscalationError(res.error || 'The escalation could not be requested.');
    } catch {
      setEscalationError('Network error — the escalation was not requested.');
    } finally {
      setIsEscalating(false);
    }
  };

  // ========== RENDER: No access — request a fresh link ==========

  if (needsLink) {
    return <RequestLinkView ticketId={ticketId} initialEmail={legacyEmail ?? ''} hadLink={Boolean(token || legacyEmail)} />;
  }

  // ========== RENDER: Loading ==========

  if (loading) {
    return (
      <div className="gov-container py-24">
        <p role="status" className="flex items-center gap-3 text-[#3b3934]">
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
          Loading ticket details…
        </p>
      </div>
    );
  }

  // ========== RENDER: Error ==========

  if (loadError || !ticket) {
    return (
      <div className="gov-container py-20">
        <div className="gov-inset gov-inset--red max-w-xl">
          <ExclamationTriangleIcon className="mb-3 h-8 w-8 text-[#ce1126]" aria-hidden="true" />
          <h1 className="gov-title-m mb-2">We could not load this ticket</h1>
          <p className="text-neutral-700 mb-6">{loadError || 'Ticket not found.'}</p>
          <button
            onClick={() => router.push(isStaff ? '/tickets/' : '/')}
            className="gov-btn"
          >
            {isStaff ? 'Back to tickets' : 'Return Home'}
          </button>
        </div>
      </div>
    );
  }

  // ========== RENDER: Ticket Detail ==========

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const isClosed = ticket.status === 'CLOSED';
  const slaDeadline = ticket.slaDeadlineAt ? new Date(ticket.slaDeadlineAt) : null;
  const isSlaPassed = slaDeadline ? slaDeadline < new Date() : false;

  const roleStyle = (role: string, internal?: boolean) =>
    internal
      ? 'border-l-[6px] border-[#ffd700] bg-[#fffbea]'
      : role === 'officer'
        ? 'border-l-[6px] border-black bg-white'
        : role === 'system'
          ? 'border-l-[6px] border-[#b9b4a9] bg-[#f5f3ee]'
          : 'border-l-[6px] border-[#ce1126] bg-white';

  const roleBadge = (role: string) =>
    role === 'officer' ? 'gov-tag' : role === 'system' ? 'gov-tag gov-tag--grey' : 'gov-tag gov-tag--red';

  const roleLabel = (role: string) =>
    role === 'officer' ? 'OneStop Centre' : role === 'system' ? 'System' : isStaff ? 'Investor' : 'You';

  return (
    <div className="bg-white">
      <div className="gov-container py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(isStaff ? '/tickets/' : isAuthenticated ? '/account' : '/')}
            className="gov-link mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {isStaff ? 'Back to tickets' : isAuthenticated ? 'Back to my submissions' : 'Back to Home'}
          </button>

          {justCreated && !isStaff && (
            <div role="status" className="gov-panel mb-8 flex gap-4">
              <CheckCircleIcon className="h-8 w-8 flex-shrink-0 text-[#ffd700]" aria-hidden="true" />
              <div className="text-[15px] text-white">
                <p className="font-display text-2xl font-semibold">Your ticket has been submitted</p>
                <p className="mt-1">
                  Bookmark this page — it&apos;s your private link to this ticket. We&apos;ve also emailed it to{' '}
                  <strong>{ticket.contactEmail}</strong>, and we&apos;ll email you whenever the OneStop Centre replies.
                </p>
                {uploadFailed && (
                  <p className="mt-2 font-semibold text-[#ffd700]">
                    Your attachments could not be uploaded. Please add them again under &ldquo;Attached Documents&rdquo; below.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-mono text-2xl font-bold text-black">{ticket.referenceNumber}</h1>
                <span
                  className={statusColors[ticket.status] || 'gov-tag gov-tag--grey'}
                >
                  {statusLabels[ticket.status] || ticket.status}
                </span>
                <span className={priorityColors[ticket.priority] || 'gov-tag gov-tag--grey'}>
                  {ticket.priority.toUpperCase()}
                </span>
                {ticket.isEscalated && (
                  <span className="gov-tag gov-tag--red">
                    ESCALATED
                  </span>
                )}
              </div>
              <h2 className="gov-title-l mt-2">{ticket.title}</h2>
            </div>
          </div>
        </div>

        {/* SLA Bar */}
        {slaDeadline && !isResolved && (
          <div
            className={`mb-8 flex items-center gap-3 ${isSlaPassed ? 'gov-inset gov-inset--red' : 'gov-inset'}`}
          >
            <ClockIcon className={`h-6 w-6 ${isSlaPassed ? 'text-[#ce1126]' : 'text-black'}`} />
            <div>
              <p className="font-bold">
                {isSlaPassed ? 'Response deadline passed' : 'Response due by'}
              </p>
              <p className="text-[15px] text-[#3b3934]">
                {formatDate(ticket.slaDeadlineAt!)}{' '}
                <span className="text-xs">(office hours: Mon–Fri, 8:00–17:00 EAT)</span>
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="border-t-4 border-black pt-5">
              <h3 className="gov-title-m mb-3">Description</h3>
              <p className="text-neutral-800 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Messages */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="gov-title-m mb-4">Messages and updates</h3>
              {ticket.messages.length === 0 ? (
                <p className="text-neutral-600 text-sm">
                  {isStaff
                    ? 'No messages yet.'
                    : 'No messages yet. Add a comment below to communicate with our team.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {ticket.messages.map((msg) => (
                    <div key={msg.id} className={`border border-[#dcd8cf] p-4 ${roleStyle(msg.authorRole, msg.isInternal)}`}>
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-black">{msg.authorName}</span>
                          <span className={roleBadge(msg.authorRole)}>
                            {roleLabel(msg.authorRole)}
                          </span>
                          {msg.isInternal && (
                            <span className="gov-tag gov-tag--gold">
                              Internal note
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-600">{formatDate(msg.sentAt)}</span>
                      </div>
                      <p className="text-sm text-neutral-800 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <TicketDocuments ticketId={ticketId} token={token} isStaff={isStaff} />

            {/* Add Comment — staff can always write (e.g. internal notes); the
                filer until the ticket is closed. */}
            {(isStaff || !isClosed) && (
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="gov-title-m mb-4">
                  {isStaff ? 'Reply or add a note' : 'Add a message'}
                </h3>
                {commentNotice && <Notice kind={commentNotice.kind}>{commentNotice.text}</Notice>}
                <form onSubmit={handleCommentSubmit}>
                  <label htmlFor="ticket-comment" className="sr-only">
                    Message
                  </label>
                  <textarea
                    id="ticket-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isStaff ? 'Write a reply to the investor, or an internal note…' : 'Add additional information or updates...'}
                    rows={4}
                    maxLength={5000}
                    className="gov-input mb-3"
                  />
                  {isStaff && (
                    <label className="flex items-center gap-2 mb-3 text-sm text-neutral-800">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="h-5 w-5"
                      />
                      Internal note (not visible to the investor, no email sent)
                    </label>
                  )}
                  <button
                    type="submit"
                    disabled={!comment.trim() || isSubmittingComment}
                    className="gov-btn"
                  >
                    {isSubmittingComment ? 'Sending...' : isStaff && !isInternalNote ? 'Send reply' : 'Submit'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {isStaff && <StaffPanel ticket={ticket} onSaved={fetchTicket} />}

            {/* Ticket Details */}
            <div>
              <h3 className="border-t-4 border-black pt-4 text-lg font-bold mb-4">Ticket Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-700 mb-1">Category</p>
                  <p className="font-medium text-black">{categoryLabels[ticket.category] || ticket.category}</p>
                </div>
                {ticket.assignee && (
                  <div>
                    <p className="text-sm text-neutral-700 mb-1 flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      Assigned To
                    </p>
                    <p className="font-medium text-black">{ticket.assignee}</p>
                  </div>
                )}
                {ticket.assignedAgencyCode && (
                  <div>
                    <p className="text-sm text-neutral-700 mb-1 flex items-center gap-1">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      Agency
                    </p>
                    <p className="font-medium text-black">{ticket.assignedAgencyCode}</p>
                  </div>
                )}
                {isStaff && (
                  <div>
                    <p className="text-sm text-neutral-700 mb-1 flex items-center gap-1">
                      <EnvelopeIcon className="w-4 h-4" />
                      Investor
                    </p>
                    <p className="font-medium text-black">{ticket.contactName}</p>
                    <p className="text-sm text-neutral-700 break-all">{ticket.contactEmail}</p>
                    {ticket.contactPhone && <p className="text-sm text-neutral-700">{ticket.contactPhone}</p>}
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-700 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Created
                  </p>
                  <p className="font-medium text-black">{formatDate(ticket.createdAt)}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm text-neutral-700 mb-1">Resolved</p>
                    <p className="font-medium text-red-600">{formatDate(ticket.resolvedAt)}</p>
                  </div>
                )}
                {isStaff && ticket.satisfactionRating ? (
                  <div>
                    <p className="text-sm text-neutral-700 mb-1">Investor rating</p>
                    <p className="font-medium text-black">{ticket.satisfactionRating} / 5</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Satisfaction Rating — the investor's own, never staff's */}
            {isResolved && !isStaff && (
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="border-t-4 border-[#ffd700] pt-4 text-lg font-bold mb-3">Rate This Service</h3>
                <p className="text-sm text-neutral-700 mb-4">How satisfied are you with the resolution?</p>
                {ratingError && <Notice kind="error">{ratingError}</Notice>}
                <div className="flex gap-2" role="group" aria-label="Rate from 1 to 5 stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingSubmit(star)}
                      disabled={isSubmittingRating}
                      aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                      aria-pressed={star <= rating}
                      className="transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      {star <= rating ? (
                        <StarIconSolid className="w-8 h-8 text-[#e6c200]" />
                      ) : (
                        <StarIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-neutral-700 mt-3">
                    You rated this ticket {rating} star{rating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Escalation Button */}
            {!isResolved && (
              <div>
                {escalationError && <Notice kind="error">{escalationError}</Notice>}
                <button
                  onClick={handleEscalation}
                  disabled={ticket.isEscalated || isEscalating}
                  className={`gov-btn w-full ${ticket.isEscalated ? 'gov-btn--secondary !cursor-default' : 'gov-btn--warning'}`}
                >
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  {ticket.isEscalated ? 'Escalated' : isEscalating ? 'Requesting...' : isStaff ? 'Escalate' : 'Request Escalation'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== NO ACCESS: REQUEST A FRESH LINK ==========

function RequestLinkView({ ticketId, initialEmail, hadLink }: { ticketId: string; initialEmail: string; hadLink: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await apiFetch(`/api/tickets/${encodeURIComponent(ticketId)}/access-link`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setResult(
        res.success
          ? {
              kind: 'success',
              text: `If ${email.trim()} is the address this ticket was filed with, we've emailed it a private link. Check your inbox (and spam folder).`,
            }
          : { kind: 'error', text: res.error || 'Something went wrong. Please try again.' },
      );
    } catch {
      setResult({ kind: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full pt-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
          <EnvelopeIcon className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-black text-center mb-2">Get a link to your ticket</h1>
        <p className="text-sm text-neutral-700 text-center mb-6">
          {hadLink
            ? 'This link is no longer valid. '
            : ''}
          Tickets open from the private link we email you. Enter the email address you used for ticket{' '}
          <strong>{ticketId}</strong> and we&apos;ll send you a new one.
        </p>
        {result && <Notice kind={result.kind}>{result.text}</Notice>}
        <form onSubmit={submit}>
          <label htmlFor="access-email" className="mb-2 block text-sm font-bold text-black">
            Email address
          </label>
          <input
            id="access-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
            className="gov-input mb-4"
          />
          <button
            type="submit"
            disabled={!email.trim() || sending}
            className="gov-btn w-full"
          >
            {sending ? 'Sending…' : 'Email me a link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-700">
          Have an account? <Link href="/account" className="font-semibold text-black underline">Sign in</Link> to see all your tickets.
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full mt-3 px-6 py-2 text-sm text-neutral-700 hover:text-black text-center"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

// ========== STAFF: MANAGE THE TICKET ==========

function StaffPanel({ ticket, onSaved }: { ticket: TicketData; onSaved: () => void }) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [agency, setAgency] = useState(ticket.assignedAgencyCode ?? '');
  const [assignee, setAssignee] = useState(ticket.assignee ?? '');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  // Re-sync when the ticket reloads (e.g. after a save or an escalation).
  useEffect(() => {
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAgency(ticket.assignedAgencyCode ?? '');
    setAssignee(ticket.assignee ?? '');
  }, [ticket]);

  useEffect(() => {
    apiFetch<Agency[]>('/api/tickets/agencies')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setAgencies(res.data);
      })
      .catch(() => {});
  }, []);

  const changes: Record<string, string> = {};
  if (status !== ticket.status) changes.status = statusApiValues[status];
  if (priority !== ticket.priority) changes.priority = priority;
  if (agency && agency !== (ticket.assignedAgencyCode ?? '')) changes.assignedAgencyCode = agency;
  if (assignee.trim() !== (ticket.assignee ?? '')) changes.assignee = assignee.trim();
  const dirty = Object.keys(changes).length > 0;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await apiFetch(`/api/tickets/${ticket.referenceNumber}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      });
      if (!res.success) {
        setNotice({ kind: 'error', text: res.error || 'The ticket could not be updated.' });
        return;
      }
      setNotice({
        kind: 'success',
        text: changes.status ? 'Saved — the investor has been emailed about the new status.' : 'Saved.',
      });
      onSaved();
    } catch {
      setNotice({ kind: 'error', text: 'Network error — nothing was saved.' });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    'gov-input';
  const labelClass = 'gov-label';
  const agencyKnown = agencies.some((a) => a.code === agency);

  return (
    <form onSubmit={save} className="border-2 border-black p-4" aria-labelledby="manage-ticket-heading">
      <h3 id="manage-ticket-heading" className="mb-4 text-lg font-bold">
        Manage ticket
      </h3>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="space-y-3">
        <div>
          <label htmlFor="manage-status" className={labelClass}>Status</label>
          <select id="manage-status" value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)} className={fieldClass}>
            {(Object.keys(statusLabels) as TicketStatus[]).map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="manage-priority" className={labelClass}>Priority</label>
          <select id="manage-priority" value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} className={fieldClass}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <p className="mt-1 text-xs text-neutral-600">Changing priority recalculates the response deadline.</p>
        </div>
        <div>
          <label htmlFor="manage-agency" className={labelClass}>Agency</label>
          <select id="manage-agency" value={agency} onChange={(e) => setAgency(e.target.value)} className={fieldClass}>
            {!agency && <option value="">Unassigned</option>}
            {agency && !agencyKnown && <option value={agency}>{agency}</option>}
            {agencies.map((a) => (
              <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="manage-assignee" className={labelClass}>Assigned officer</label>
          <input
            id="manage-assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            maxLength={100}
            placeholder="Officer name"
            className={fieldClass}
          />
        </div>
        <button
          type="submit"
          disabled={!dirty || saving}
          className="gov-btn w-full"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

// ========== TICKET DOCUMENTS ==========

interface TicketDocument {
  id: string;
  fileName: string;
  mimeType: string;
  storageUrl: string;
  uploadedAt: string;
}

// Mirrors the backend upload allowlist and limits (UploadController).
const DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp';
const DOC_MAX_BYTES = 10 * 1024 * 1024;
const DOC_MAX_PER_UPLOAD = 5;

function TicketDocuments({ ticketId, token, isStaff }: { ticketId: string; token: string | null; isStaff: boolean }) {
  const [docs, setDocs] = useState<TicketDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Only rendered once the ticket itself loaded, so the viewer is authorized.
  const tokenQuery = !isStaff && token ? `?token=${encodeURIComponent(token)}` : '';

  const fetchDocs = useCallback(async () => {
    try {
      const res = await apiFetch<TicketDocument[]>(`/api/tickets/${ticketId}/documents${tokenQuery}`);
      if (res.success && res.data) setDocs(res.data);
    } catch {
      // Documents are supplementary — a failed fetch just shows an empty list.
    } finally {
      setLoading(false);
    }
  }, [ticketId, tokenQuery]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploadMessage(null);

    if (files.length > DOC_MAX_PER_UPLOAD) {
      setUploadMessage({ type: 'error', text: `Select at most ${DOC_MAX_PER_UPLOAD} files at a time.` });
      return;
    }
    const tooBig = files.find((f) => f.size > DOC_MAX_BYTES);
    if (tooBig) {
      setUploadMessage({ type: 'error', text: `${tooBig.name} is larger than 10MB.` });
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      files.forEach((file) => body.append('files', file));
      body.append('ticketRefNumber', ticketId);
      // Staff and signed-in owners are authorized by session; link holders by the token.
      if (!isStaff && token) body.append('accessToken', token);

      const res = await fetch(resolveApiUrl('/api/upload/'), { method: 'POST', body, credentials: 'include' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setUploadMessage({ type: 'error', text: json?.detail ?? json?.error ?? 'Upload failed. Please try again.' });
        return;
      }
      setUploadMessage({ type: 'success', text: `${files.length} file${files.length === 1 ? '' : 's'} uploaded.` });
      await fetchDocs();
    } catch {
      setUploadMessage({ type: 'error', text: 'Network error — upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="border-t border-neutral-200 pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Attached Documents</h3>
        <input
          ref={fileInputRef}
          id="ticket-doc-upload"
          type="file"
          multiple
          accept={DOC_ACCEPT}
          onChange={handleUpload}
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gov-btn gov-btn--secondary gov-btn--sm"
        >
          {uploading ? 'Uploading…' : 'Add documents'}
        </button>
      </div>
      {uploadMessage && (
        <p
          role={uploadMessage.type === 'error' ? 'alert' : 'status'}
          className={`mb-3 text-sm ${uploadMessage.type === 'error' ? 'text-red-700' : 'text-black'}`}
        >
          {uploadMessage.text}
        </p>
      )}
      {docs.length === 0 && (
        <p className="text-sm text-neutral-600">No documents yet. PDF, Word, Excel or image files, up to 10MB each.</p>
      )}
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-medium text-black truncate">{doc.fileName}</p>
                <p className="text-xs text-neutral-600">{doc.mimeType} &middot; {new Date(doc.uploadedAt).toLocaleDateString('en-UG')}</p>
              </div>
            </div>
            <a
              // Files are served only through the access-checked content
              // endpoint (raw /uploads paths are never exposed by the server).
              href={resolveApiUrl(`/api/tickets/${ticketId}/documents/${doc.id}/content${tokenQuery}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex-shrink-0 text-sm font-semibold text-[#9a0d1c] underline underline-offset-4"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
