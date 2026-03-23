'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { apiFetch } from '@/lib/api-client';

// --- Types matching Sanity API response ---

interface TicketMessage {
  _id: string;
  content: string;
  authorName: string;
  authorRole: 'investor' | 'officer' | 'system';
  sentAt: string;
}

interface TicketData {
  _id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  contactName: string;
  contactEmail: string;
  assignee?: string;
  assignedAgency?: { _id: string; name: string; code?: string };
  slaDeadlineAt?: string;
  satisfactionRating?: number;
  isEscalated: boolean;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
  messages: TicketMessage[];
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

const statusLabels: Record<string, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_EXTERNAL: 'Pending External',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const priorityColors: Record<string, string> = {
  low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800 border-blue-200',
  ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
  IN_PROGRESS: 'bg-yellow-100 text-neutral-800 border-yellow-200',
  PENDING_EXTERNAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RESOLVED: 'bg-yellow-200 text-neutral-900 border-yellow-300',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
};

// --- Component ---

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);

  // --- Data fetching ---

  const fetchTicket = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);
      try {
        const json = await apiFetch<TicketData>(
          `/api/tickets/${ticketId}?email=${encodeURIComponent(email)}`
        );

        if (!json.success) {
          const errLower = (json.error || '').toLowerCase();
          if (errLower.includes('email') && errLower.includes('mismatch')) {
            setNeedsVerification(true);
            setError(
              'Email does not match. Please enter the email used when submitting the inquiry.'
            );
          } else if (errLower.includes('not found')) {
            setError('Ticket not found. Please check the reference number.');
          } else {
            setError(json.error || 'Failed to load ticket');
          }
          return;
        }

        setTicket(json.data as TicketData);
        setRating((json.data as TicketData).satisfactionRating || 0);
        setEscalated((json.data as TicketData).isEscalated);
        setNeedsVerification(false);
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [ticketId]
  );

  useEffect(() => {
    if (!emailParam) {
      setNeedsVerification(true);
      setLoading(false);
      return;
    }
    fetchTicket(emailParam);
  }, [emailParam, fetchTicket]);

  // --- Handlers ---

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmail.trim()) return;
    const url = new URL(window.location.href);
    url.searchParams.set('email', verifyEmail.trim());
    window.history.replaceState({}, '', url.toString());
    fetchTicket(verifyEmail.trim());
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !ticket || !emailParam) return;

    setIsSubmittingComment(true);
    setCommentSuccess(false);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: comment.trim(),
          authorName: ticket.contactName,
          authorEmail: emailParam,
        }),
      });
      if (res.success) {
        setComment('');
        setCommentSuccess(true);
        fetchTicket(emailParam);
        setTimeout(() => setCommentSuccess(false), 3000);
      }
    } catch {
      /* silently handled */
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRatingSubmit = async (newRating: number) => {
    if (!ticket || !emailParam) return;
    setIsSubmittingRating(true);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ email: emailParam, satisfactionRating: newRating }),
      });
      if (res.success) setRating(newRating);
    } catch {
      /* silently handled */
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleEscalation = async () => {
    if (!ticket || !emailParam || escalated) return;
    setIsEscalating(true);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ email: emailParam, isEscalated: true }),
      });
      if (res.success) setEscalated(true);
    } catch {
      /* silently handled */
    } finally {
      setIsEscalating(false);
    }
  };

  // --- Helpers ---

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'officer':
        return 'bg-purple-50 border-purple-100';
      case 'system':
        return 'bg-gray-50 border-gray-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'officer':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // ========== RENDER: Email Verification ==========

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-7 h-7 text-yellow-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter the email address used when submitting inquiry{' '}
            <strong>{ticketId}</strong> to view its status.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={handleVerify}>
            <input
              type="email"
              value={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-4"
            />
            <button
              type="submit"
              disabled={!verifyEmail.trim() || loading}
              className="w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & View Ticket'}
            </button>
          </form>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-3 px-6 py-2 text-sm text-gray-600 hover:text-gray-900 text-center"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // ========== RENDER: Loading ==========

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  // ========== RENDER: Error ==========

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Ticket
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Ticket not found.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // ========== RENDER: Ticket Detail ==========

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const slaDeadline = ticket.slaDeadlineAt ? new Date(ticket.slaDeadlineAt) : null;
  const isSlaPassed = slaDeadline ? slaDeadline < new Date() : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {ticket.referenceNumber}
                </h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded border ${
                    statusColors[ticket.status] ||
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {statusLabels[ticket.status] || ticket.status}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded border ${
                    priorityColors[ticket.priority] || ''
                  }`}
                >
                  {ticket.priority.toUpperCase()}
                </span>
                {escalated && (
                  <span className="px-3 py-1 text-sm font-medium rounded border bg-red-100 text-red-800 border-red-200">
                    ESCALATED
                  </span>
                )}
              </div>
              <h2 className="text-xl text-gray-900 font-semibold">
                {ticket.title}
              </h2>
            </div>
          </div>
        </div>

        {/* SLA Bar */}
        {slaDeadline && !isResolved && (
          <div
            className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
              isSlaPassed
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <ClockIcon
              className={`w-5 h-5 ${
                isSlaPassed ? 'text-red-600' : 'text-blue-600'
              }`}
            />
            <div>
              <p
                className={`font-semibold text-sm ${
                  isSlaPassed ? 'text-red-800' : 'text-blue-800'
                }`}
              >
                {isSlaPassed ? 'SLA Deadline Passed' : 'SLA Deadline'}
              </p>
              <p
                className={`text-sm ${
                  isSlaPassed ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {formatDate(ticket.slaDeadlineAt!)}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Messages & Updates
              </h3>
              {ticket.messages.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No messages yet. Add a comment below to communicate with our
                  team.
                </p>
              ) : (
                <div className="space-y-4">
                  {ticket.messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-4 rounded-lg border ${getRoleStyle(
                        msg.authorRole
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">
                            {msg.authorName}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadge(
                              msg.authorRole
                            )}`}
                          >
                            {msg.authorRole === 'officer'
                              ? 'UIA Officer'
                              : msg.authorRole === 'system'
                                ? 'System'
                                : 'You'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(msg.sentAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment */}
            {!isResolved && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Comment
                </h3>
                {commentSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">
                      Comment added successfully!
                    </p>
                  </div>
                )}
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add additional information or updates..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-3"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || isSubmittingComment}
                    className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmittingComment ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ticket Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-medium text-gray-900">
                    {categoryLabels[ticket.category] || ticket.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded border ${
                      priorityColors[ticket.priority] || ''
                    }`}
                  >
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                {ticket.assignee && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      Assigned To
                    </p>
                    <p className="font-medium text-gray-900">
                      {ticket.assignee}
                    </p>
                  </div>
                )}
                {ticket.assignedAgency && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      Agency
                    </p>
                    <p className="font-medium text-gray-900">
                      {ticket.assignedAgency.name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Created
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolved</p>
                    <p className="font-medium text-yellow-600">
                      {formatDate(ticket.resolvedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SLA Info */}
            {slaDeadline && (
              <div
                className={`rounded-lg p-6 ${
                  isSlaPassed && !isResolved
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    isSlaPassed && !isResolved
                      ? 'text-red-900'
                      : 'text-blue-900'
                  }`}
                >
                  SLA Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p
                    className={
                      isSlaPassed && !isResolved
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }
                  >
                    <span className="font-medium">Category:</span>{' '}
                    {categoryLabels[ticket.category] || ticket.category}
                  </p>
                  <p
                    className={
                      isSlaPassed && !isResolved
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }
                  >
                    <span className="font-medium">Deadline:</span>{' '}
                    {formatDate(ticket.slaDeadlineAt!)}
                  </p>
                </div>
              </div>
            )}

            {/* Satisfaction Rating */}
            {isResolved && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Rate This Service
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  How satisfied are you with the resolution?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingSubmit(star)}
                      disabled={isSubmittingRating}
                      className="transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      {star <= rating ? (
                        <StarIconSolid className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    You rated this ticket {rating} star
                    {rating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Escalation Button */}
            {!isResolved && (
              <button
                onClick={handleEscalation}
                disabled={escalated || isEscalating}
                className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  escalated
                    ? 'bg-red-100 border border-red-200 text-red-700 cursor-default'
                    : 'bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700'
                }`}
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                {escalated
                  ? 'Escalation Requested'
                  : isEscalating
                    ? 'Requesting...'
                    : 'Request Escalation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
