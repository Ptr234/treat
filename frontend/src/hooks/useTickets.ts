'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SupportTicket } from '@/types';
import { apiFetch } from '@/lib/api-client';

interface SanityTicketRow {
  _id: string;
  referenceNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  contactName: string;
  contactEmail: string;
  assignee?: string;
  slaDeadlineAt?: string;
  isEscalated?: boolean;
  createdAt: string;
  resolvedAt?: string;
  assignedAgency?: { name: string; code: string };
}

function mapToSupportTicket(t: SanityTicketRow): SupportTicket {
  return {
    id: t.referenceNumber,
    title: t.title,
    description: '',
    category: t.category as SupportTicket['category'],
    status: t.status as SupportTicket['status'],
    priority: t.priority as SupportTicket['priority'],
    assignee: t.assignee,
    assigneeAgency: t.assignedAgency?.name,
    createdAt: t.createdAt,
    updatedAt: t.resolvedAt || t.createdAt,
    slaDeadline: t.slaDeadlineAt || '',
    history: [],
    attachments: [],
    contactEmail: t.contactEmail,
    contactName: t.contactName,
  };
}

interface UseTicketsReturn {
  data: SupportTicket[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => void;
}

export function useTickets(): UseTicketsReturn {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTickets = useCallback(async () => {
    try {
      const json = await apiFetch<{ tickets: SanityTicketRow[]; total: number }>('/api/tickets?from=0&to=100');
      if (!json.success) throw new Error(json.error || 'Unknown error');

      // ASP.NET returns { tickets, total }; Next.js returns array directly
      const raw = json.data;
      const tickets: SanityTicketRow[] = Array.isArray(raw) ? raw : (raw?.tickets ?? []);
      setData(tickets.map(mapToSupportTicket));
      setTotal(raw && 'total' in raw ? raw.total : tickets.length);
      setError(null);
    } catch (err) {
      console.error('[useTickets] fetch failed:', err);
      setData([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { data, loading, error, total, refresh: fetchTickets };
}
