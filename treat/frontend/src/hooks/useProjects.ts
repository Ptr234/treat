'use client';

import { useFirestoreCollection } from './useFirestoreCollection';
import { mockProjects } from '@/data/mock/projects';
import type { LicensedProject } from '@/types';

export function useProjects() {
  return useFirestoreCollection<LicensedProject>(
    'projects',
    mockProjects,
    { orderByField: 'investmentValue', orderDirection: 'desc' }
  );
}
