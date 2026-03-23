'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockDashboardMetrics } from '@/data/mock/dashboard';
import type { DGDashboardMetrics } from '@/types';

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
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');

      if (json.isEmpty) {
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

      const incoming = json.data as DGDashboardMetrics;
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
