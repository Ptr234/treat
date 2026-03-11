'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockTickets } from '@/data/mock/tickets';
import type { SupportTicket } from '@/types';

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
  const [data, setData] = useState<SupportTicket[]>(mockTickets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(mockTickets.length);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets?from=0&to=100', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');

      const tickets: SanityTicketRow[] = json.data;
      if (tickets.length === 0) {
        // Empty dataset — fall back to mock
        setData(mockTickets);
        setTotal(mockTickets.length);
      } else {
        setData(tickets.map(mapToSupportTicket));
        setTotal(json.meta?.total ?? tickets.length);
      }
      setError(null);
    } catch (err) {
      console.error('[useTickets] fetch failed, using mock data:', err);
      setData(mockTickets);
      setTotal(mockTickets.length);
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
