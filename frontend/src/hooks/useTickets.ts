'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SupportTicket, TicketStatus, TicketPriority } from '@/types';
import { apiFetch } from '@/lib/api-client';
import { normalizeStatus, normalizePriority, normalizeCategory, hoursBetween } from '@/lib/ticket-format';

/** A row as returned by the ASP.NET ticket list endpoint. */
interface TicketRow {
  referenceNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  contactName: string;
  contactEmail: string;
  assignee?: string;
  assignedAgencyCode?: string;
  slaDeadlineAt?: string;
  isEscalated?: boolean;
  createdAt: string;
  resolvedAt?: string;
}

/** Headline numbers over every ticket the viewer can see (not just the current page). */
export interface TicketStats {
  total: number;
  open: number;
  resolved: number;
  escalated: number;
  slaBreached: number;
  avgResolutionHours: number | null;
}

interface TicketListResponse {
  tickets: TicketRow[];
  total: number;
  page: number;
  pageSize: number;
  stats?: TicketStats;
}

export type TicketSort = 'newest' | 'oldest' | 'priority' | 'sla';

export interface TicketQuery {
  page: number;
  pageSize: number;
  status: TicketStatus | 'ALL';
  priority: TicketPriority | 'ALL';
  search: string;
  sort: TicketSort;
}

// UI status → the value the API filters on.
const statusParam: Record<TicketStatus, string> = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING_EXTERNAL: 'pending_external',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

function mapToSupportTicket(t: TicketRow): SupportTicket {
  const resolutionHours = hoursBetween(t.createdAt, t.resolvedAt);
  return {
    id: t.referenceNumber,
    title: t.title,
    description: '',
    category: normalizeCategory(t.category),
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    assignee: t.assignee,
    assigneeAgency: t.assignedAgencyCode,
    isEscalated: t.isEscalated,
    createdAt: t.createdAt,
    updatedAt: t.resolvedAt || t.createdAt,
    slaDeadline: t.slaDeadlineAt || '',
    resolutionTime: resolutionHours !== null ? `${resolutionHours.toFixed(1)} hours` : undefined,
    history: [],
    attachments: [],
    contactEmail: t.contactEmail,
    contactName: t.contactName,
  };
}

export function buildTicketListPath(q: TicketQuery): string {
  const params = new URLSearchParams({ page: String(q.page), pageSize: String(q.pageSize), sort: q.sort });
  if (q.status !== 'ALL') params.set('status', statusParam[q.status]);
  if (q.priority !== 'ALL') params.set('priority', q.priority);
  if (q.search.trim()) params.set('q', q.search.trim());
  return `/api/tickets?${params.toString()}`;
}

interface UseTicketsReturn {
  data: SupportTicket[];
  loading: boolean;
  error: string | null;
  /** Tickets matching the current filters (across all pages). */
  total: number;
  stats: TicketStats | null;
  refresh: () => void;
}

/**
 * The staff ticket board. Filtering, search, sorting and paging happen on the
 * server, so every ticket is reachable however many there are (the board used
 * to load only the newest 100 and filter those in the browser). `enabled` gates
 * the request: `/api/tickets` is staff-only, so calling it for anyone else is a
 * guaranteed 401/403.
 */
export function useTickets(query: TicketQuery, enabled: boolean = true): UseTicketsReturn {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const path = buildTicketListPath(query);

  const fetchTickets = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setTotal(0);
      setStats(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const json = await apiFetch<TicketListResponse>(path);
      if (!json.success || !json.data) throw new Error(json.error || 'Failed to load tickets');
      setData((json.data.tickets ?? []).map(mapToSupportTicket));
      setTotal(json.data.total ?? 0);
      setStats(json.data.stats ?? null);
      setError(null);
    } catch (err) {
      console.error('[useTickets] fetch failed:', err);
      setData([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [enabled, path]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { data, loading, error, total, stats, refresh: fetchTickets };
}
