'use client';

import useSWR from 'swr';
import { apiFetch } from '@/lib/api-client';

interface DashboardStats {
  kpis: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    escalatedTickets: number;
    slaBreached: number;
    avgRating: number;
    recentTickets: number;
    totalInvestors: number;
    totalChatSessions: number;
    totalInquiries: number;
    totalAppointments: number;
    recentInquiries: number;
    recentAppointments: number;
    chatEscalations: number;
    totalMessages: number;
    recentMessages: number;
    toolUsageCount: number;
    downloadCount: number;
    searchCount: number;
  };
  ticketsByCategory: Array<{ Category: string; Count: number }>;
  ticketsByStatus: Array<{ Status: string; Count: number }>;
  toolBreakdown: Array<{ Tool: string; Count: number }>;
  topDownloads: Array<{ Resource: string; Count: number }>;
}

const dashboardFetcher = async (url: string) => {
  const json = await apiFetch<DashboardStats>(url);
  if (!json.success) throw new Error(json.error || 'Failed to load dashboard');
  return json.data;
};

interface UseDashboardSWRReturn {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
}

export function useDashboardSWR(): UseDashboardSWRReturn {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/dashboard',
    dashboardFetcher,
    {
      // Dashboard stats cached for 5 minutes in browser (server caches for 5 min too)
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute deduplication
      focusThrottleInterval: 300000, // 5 minutes
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    mutate: async () => {
      await mutate();
    },
  };
}
