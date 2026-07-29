'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockDashboardMetrics } from '@/data/mock/dashboard';
import type { DGDashboardMetrics } from '@/types';
import { apiFetch } from '@/lib/api-client';

export type RefreshInterval = 30_000 | 60_000 | 300_000;

export interface MetricsDelta {
  liveInquiries: number;
  activeCases: number;
  pendingApprovals: number;
  escalatedCount: number;
  pipelineValue: number;
  responseRate: number;
  slaCompliance: number;
}

interface DashboardState {
  metrics: DGDashboardMetrics | null;
  prevMetrics: DGDashboardMetrics | null;
  delta: MetricsDelta | null;
  loading: boolean;
  error: string | null;
  isLive: boolean;
  lastUpdated: Date | null;
  refreshInterval: RefreshInterval;
}

type BackendDashboard = DGDashboardMetrics & { kpis?: Record<string, number> };

/**
 * Map the ASP.NET dashboard payload (flat KPI counters under `.kpis`) onto the
 * DGDashboardMetrics shape the UI renders. Derives rates the backend doesn't
 * expose directly (response rate, SLA compliance, satisfaction) from the raw
 * counts. The Next.js fallback route already returns the DGDashboardMetrics
 * shape, so it passes through untouched.
 */
function mapBackendMetrics(raw: BackendDashboard): DGDashboardMetrics {
  if (!raw.kpis) return raw;
  const k = raw.kpis;

  const openTickets = k.openTickets ?? 0;
  const totalTickets = k.totalTickets ?? 0;
  const resolvedTickets = k.resolvedTickets ?? 0;
  const slaBreached = k.slaBreached ?? 0;
  const avgRating = k.avgRating ?? 0;
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  return {
    liveInquiries: k.recentInquiries ?? k.totalInquiries ?? 0,
    activeCases: openTickets,
    pendingApprovals: k.totalAppointments ?? 0,
    escalatedCount: k.escalatedTickets ?? 0,
    // Capital still in the investor funnel, reported by the API in USD and
    // displayed in billions.
    pipelineValue: (k.pipelineValueUsd ?? 0) / 1_000_000_000,
    responseRate: pct(resolvedTickets, totalTickets),
    conversionRate: k.conversionRate ?? 0,
    slaCompliance: openTickets > 0 ? Math.round((1 - slaBreached / openTickets) * 100) : 100,
    investorSatisfaction: pct(avgRating, 5),
    agencyScorecard: raw.agencyScorecard ?? [],
    alerts: raw.alerts ?? [],
    recentActivity: raw.recentActivity ?? [],
    // Pass through the extended KPI counters for secondary displays.
    totalInquiries: k.totalInquiries,
    totalAppointments: k.totalAppointments,
    recentInquiries: k.recentInquiries,
    recentAppointments: k.recentAppointments,
    chatEscalations: k.chatEscalations,
    totalMessages: k.totalMessages,
    recentMessages: k.recentMessages,
    toolUsageCount: k.toolUsageCount,
    downloadCount: k.downloadCount,
    searchCount: k.searchCount,
  };
}

function computeDelta(
  current: DGDashboardMetrics,
  prev: DGDashboardMetrics | null,
): MetricsDelta | null {
  if (!prev) return null;
  return {
    liveInquiries: current.liveInquiries - prev.liveInquiries,
    activeCases: current.activeCases - prev.activeCases,
    pendingApprovals: current.pendingApprovals - prev.pendingApprovals,
    escalatedCount: (current.escalatedCount ?? 0) - (prev.escalatedCount ?? 0),
    pipelineValue: (current.pipelineValue ?? 0) - (prev.pipelineValue ?? 0),
    responseRate: current.responseRate - prev.responseRate,
    slaCompliance: current.slaCompliance - prev.slaCompliance,
  };
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    metrics: null,
    prevMetrics: null,
    delta: null,
    loading: true,
    error: null,
    isLive: false,
    lastUpdated: null,
    refreshInterval: 60_000,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const json = await apiFetch<DGDashboardMetrics & { kpis?: Record<string, number> }>('/api/dashboard');
      if (!json.success) throw new Error(json.error || 'Unknown error');

      // Only fall back to mock when the API returned no payload at all. An empty
      // (zeroed) dataset is still real, live data and must be shown honestly —
      // never substitute fabricated KPIs for a genuinely empty system.
      if (!json.data) {
        setState((prev) => ({
          ...prev,
          prevMetrics: prev.metrics,
          metrics: mockDashboardMetrics,
          delta: prev.metrics ? computeDelta(mockDashboardMetrics, prev.metrics) : null,
          loading: false,
          error: null,
          isLive: false,
          lastUpdated: new Date(),
        }));
        return;
      }

      // Normalize: ASP.NET nests KPIs under .kpis (mapped/derived here); the
      // Next.js fallback route already returns the DGDashboardMetrics shape.
      const incoming = mapBackendMetrics(json.data as BackendDashboard);
      setState((prev) => ({
        ...prev,
        prevMetrics: prev.metrics,
        metrics: incoming,
        delta: computeDelta(incoming, prev.metrics),
        loading: false,
        error: null,
        isLive: true,
        lastUpdated: new Date(),
      }));
    } catch (err) {
      console.error('[useDashboard] fetch failed, using mock data:', err);
      setState((prev) => ({
        ...prev,
        prevMetrics: prev.metrics,
        metrics: mockDashboardMetrics,
        delta: prev.metrics ? computeDelta(mockDashboardMetrics, prev.metrics) : null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
        isLive: false,
        lastUpdated: new Date(),
      }));
    }
  }, []);

  const setRefreshInterval = useCallback((interval: RefreshInterval) => {
    setState((prev) => ({ ...prev, refreshInterval: interval }));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-refresh on interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchDashboard, state.refreshInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchDashboard, state.refreshInterval]);

  return {
    metrics: state.metrics,
    prevMetrics: state.prevMetrics,
    delta: state.delta,
    loading: state.loading,
    error: state.error,
    isLive: state.isLive,
    lastUpdated: state.lastUpdated,
    refreshInterval: state.refreshInterval,
    setRefreshInterval,
    refresh: fetchDashboard,
  };
}

export default useDashboard;
