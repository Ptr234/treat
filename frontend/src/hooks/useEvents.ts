'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import { mapSanityEvent } from '@/lib/event-format';
import type { InvestmentEvent } from '@/types';
import type { SanityEvent } from '@/types/sanity';

interface UseEventsReturn {
  data: InvestmentEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Loads published events from Sanity (via the Next.js /api/events route) and
 * maps them to the shape the public events UI expects. Returns an empty list
 * (not sample data) when Sanity has no published events, so the page reflects
 * the CMS state.
 */
export function useEvents(): UseEventsReturn {
  const [data, setData] = useState<InvestmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<SanityEvent[]>('/api/events');
      if (res.success && Array.isArray(res.data)) {
        setData(res.data.map(mapSanityEvent));
        setError(null);
      } else {
        setData([]);
        setError(res.error ?? 'Failed to load events');
      }
    } catch (err) {
      setData([]);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { data, loading, error, refresh: fetchEvents };
}
