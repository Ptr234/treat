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

      // Normalize: ASP.NET nests KPIs under .kpis; Next.js puts them at top level
      const raw = json.data;
      const incoming = (raw.kpis ? { ...raw, ...raw.kpis } : raw) as DGDashboardMetrics;
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
