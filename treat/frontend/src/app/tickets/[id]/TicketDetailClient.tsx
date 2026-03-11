'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { SupportTicket, TicketPriority } from '@/types';
import StatusTimeline from '@/components/tickets/StatusTimeline';
import SLAIndicator from '@/components/tickets/SLAIndicator';

interface TicketDetailClientProps {
  ticket: SupportTicket | null;
  ticketId: string;
}

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};

const categoryLabels: Record<string, string> = {
  general_inquiry: 'General Inquiry',
  procedure_query: 'Procedure Query',
  application_support: 'Application Support',
  license_delay: 'License Delay',
  complaint: 'Complaint',
  vip: 'VIP Investor'
};

export default function TicketDetailClient({ ticket: initialTicket, ticketId: _ticketId }: TicketDetailClientProps) {
  const router = useRouter();
  // Ticket data provided by server component (Sanity fetch in Plan 03)
  const [ticket] = useState<SupportTicket | null>(initialTicket);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(initialTicket?.satisfaction || 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!ticket) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmittingComment(true);

    // Mock: Store in localStorage
    const comments = JSON.parse(localStorage.getItem(`ticket_${ticket.id}_comments`) || '[]');
    comments.push({
      id: `comment-${Date.now()}`,
      text: comment,
      timestamp: new Date().toISOString(),
      author: ticket.contactName
    });
    localStorage.setItem(`ticket_${ticket.id}_comments`, JSON.stringify(comments));

    setTimeout(() => {
      setComment('');
      setIsSubmittingComment(false);
      alert('Comment added successfully!');
    }, 500);
  };

  const handleRatingSubmit = (newRating: number) => {
    setRating(newRating);
    localStorage.setItem(`ticket_${ticket.id}_rating`, String(newRating));
    alert(`Thank you for rating this ticket ${newRating} stars!`);
  };

  const handleEscalation = () => {
    alert('Escalation request submitted. A senior officer will review this ticket within 1 hour.');
  };

  const ticketNumber = ticket.id.replace('TKT-', '#TK-');
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/tickets/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tickets
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{ticketNumber}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded border ${
                  ticket.status === 'NEW' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  ticket.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-neutral-800 border-yellow-200' :
                  ticket.status === 'PENDING_EXTERNAL' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  ticket.status === 'RESOLVED' ? 'bg-yellow-200 text-neutral-900 border-yellow-300' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded border ${priorityColors[ticket.priority]}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl text-gray-900 font-semibold">{ticket.title}</h2>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Lifecycle Progress</h3>
          <StatusTimeline currentStatus={ticket.status} history={ticket.history} />
        </div>

        {/* SLA Indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Service Level Agreement</h3>
              <p className="text-sm text-gray-600">Target response and resolution time</p>
            </div>
            <SLAIndicator deadline={ticket.slaDeadline} status={ticket.status} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* History Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
              <div className="space-y-4">
                {ticket.history.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-600" />
                      {index < ticket.history.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{entry.action}</p>
                          <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                          <p className="text-xs text-gray-500 mt-1">{entry.actor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Comment</h3>
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
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{categoryLabels[ticket.category]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded border ${priorityColors[ticket.priority]}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                {ticket.assignee && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        Assigned To
                      </p>
                      <p className="font-medium text-gray-900">{ticket.assignee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        Agency
                      </p>
                      <p className="font-medium text-gray-900">{ticket.assigneeAgency}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Created
                  </p>
                  <p className="font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Last Updated
                  </p>
                  <p className="font-medium text-gray-900">{formatDate(ticket.updatedAt)}</p>
                </div>
                {ticket.responseTime && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Response Time</p>
                    <p className="font-medium text-yellow-600">{ticket.responseTime}</p>
                  </div>
                )}
                {ticket.resolutionTime && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolution Time</p>
                    <p className="font-medium text-yellow-600">{ticket.resolutionTime}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SLA Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">SLA Information</h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <span className="font-medium">Category:</span> {categoryLabels[ticket.category]}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">Priority:</span> {ticket.priority.toUpperCase()}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">Deadline:</span> {formatDate(ticket.slaDeadline)}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PaperClipIcon className="w-5 h-5" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {ticket.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      </div>
                      <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Satisfaction Rating (only for resolved/closed) */}
            {isResolved && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate This Service</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How satisfied are you with the resolution?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingSubmit(star)}
                      className="transition-transform hover:scale-110"
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
                    You rated this ticket {rating} star{rating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Escalation Button */}
            {!isResolved && (
              <button
                onClick={handleEscalation}
                className="w-full px-6 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                Request Escalation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
