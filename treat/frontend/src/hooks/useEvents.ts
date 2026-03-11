'use client';

import { useFirestoreCollection } from './useFirestoreCollection';
import { mockEvents } from '@/data/mock/events';
import type { InvestmentEvent } from '@/types';

export function useEvents() {
  return useFirestoreCollection<InvestmentEvent>(
    'events',
    mockEvents,
    { orderByField: 'date', orderDirection: 'desc' }
  );
}
