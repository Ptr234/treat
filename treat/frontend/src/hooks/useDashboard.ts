'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockDashboardMetrics } from '@/data/mock/dashboard';
import type { DGDashboardMetrics } from '@/types';

interface DashboardState {
  metrics: DGDashboardMetrics;
  loading: boolean;
  error: string | null;
  isLive: boolean; // true when data comes from Sanity, false when using mock fallback
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    metrics: mockDashboardMetrics,
    loading: true,
    error: null,
    isLive: false,
  });

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');

      // If Sanity has no data yet, keep mock data but signal it
      if (json.isEmpty) {
        setState({
          metrics: mockDashboardMetrics,
          loading: false,
          error: null,
          isLive: false,
        });
        return;
      }

      setState({
        metrics: json.data as DGDashboardMetrics,
        loading: false,
        error: null,
        isLive: true,
      });
    } catch (err) {
      console.error('[useDashboard] fetch failed, using mock data:', err);
      setState({
        metrics: mockDashboardMetrics,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
        isLive: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Refresh every 60 seconds for near-real-time updates
    const interval = setInterval(fetchDashboard, 60_000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    metrics: state.metrics,
    loading: state.loading,
    error: state.error,
    isLive: state.isLive,
    refresh: fetchDashboard,
  };
}

export default useDashboard;
