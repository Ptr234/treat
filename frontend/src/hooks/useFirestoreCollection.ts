'use client';

import { useState } from 'react';

interface UseCollectionOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: unknown[];
}

interface UseCollectionReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  add: (item: Omit<T, 'id'>) => Promise<string | null>;
  update: (id: string, updates: Partial<T>) => Promise<boolean>;
  getById: (id: string) => Promise<T | null>;
  refresh: () => void;
}

// Stub replacing Firestore collection hook — returns fallback data until Sanity integration (Plan 03)
export function useFirestoreCollection<T extends { id?: string }>(
  _collectionName: string,
  fallbackData: T[],
  _options: UseCollectionOptions = {}
): UseCollectionReturn<T> {
  const [data] = useState<T[]>(fallbackData);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const add = async (_item: Omit<T, 'id'>): Promise<string | null> => {
    return null;
  };

  const update = async (_id: string, _updates: Partial<T>): Promise<boolean> => {
    return false;
  };

  const getById = async (id: string): Promise<T | null> => {
    return fallbackData.find((item) => item.id === id) || null;
  };

  const refresh = () => {};

  return { data, loading, error, add, update, getById, refresh };
}

export default useFirestoreCollection;
