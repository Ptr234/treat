'use client';

import useSWR from 'swr';
import type { SupportTicket } from '@/types';
import { apiFetch } from '@/lib/api-client';
import { normalizeStatus, normalizePriority, normalizeCategory, hoursBetween } from '@/lib/ticket-format';

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
  const resolutionHours = hoursBetween(t.createdAt, t.resolvedAt);
  return {
    id: t.referenceNumber,
    title: t.title,
    description: '',
    category: normalizeCategory(t.category),
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    assignee: t.assignee,
    assigneeAgency: t.assignedAgency?.name,
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

const fetcher = async (url: string) => {
  const json = await apiFetch<{ tickets: SanityTicketRow[]; total: number }>(url);
  if (!json.success) throw new Error(json.error || 'Unknown error');

  const raw = json.data;
  const tickets: SanityTicketRow[] = Array.isArray(raw) ? raw : (raw?.tickets ?? []);
  return {
    tickets: tickets.map(mapToSupportTicket),
    total: raw && 'total' in raw ? raw.total : tickets.length,
  };
};

interface UseTicketsSWRReturn {
  data: SupportTicket[];
  loading: boolean;
  error: string | null;
  total: number;
  mutate: () => Promise<void>;
}

export function useTicketsSWR(): UseTicketsSWRReturn {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/tickets?from=0&to=100',
    fetcher,
    {
      // Cache for 1 minute in browser
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute deduplication
      focusThrottleInterval: 300000, // 5 minutes between focus revalidations
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data: data?.tickets ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    total: data?.total ?? 0,
    mutate: async () => {
      await mutate();
    },
  };
}
