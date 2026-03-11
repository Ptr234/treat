'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockProjects } from '@/data/mock/projects';
import type { LicensedProject, ProjectStatus } from '@/types';

function mapSanityStatus(status: string): ProjectStatus {
  switch (status) {
    case 'Operational': return 'active';
    case 'Under Construction': return 'under_construction';
    case 'Licensed': return 'planned';
    case 'Suspended':
    case 'Cancelled':
    default: return 'completed';
  }
}

interface SanityProject {
  _id: string;
  companyName: string;
  referenceNumber?: string;
  sector: string;
  subSector?: string;
  region: string;
  district?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  investmentValueUSD?: number;
  employmentLocal?: number;
  employmentForeign?: number;
  status: string;
  nationality?: string;
  industrialParkName?: string;
  licenseDate?: string;
}

export function useProjects() {
  const [data, setData] = useState<LicensedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data?.length) {
        setData(mockProjects);
        setLoading(false);
        return;
      }

      const mapped: LicensedProject[] = json.data.map((p: SanityProject) => ({
        id: p._id,
        name: p.companyName,
        company: p.companyName,
        sector: p.sector || 'Other',
        subSector: p.subSector,
        region: p.region || 'Central',
        district: p.district || p.location || '',
        coordinates: p.coordinates || { lat: 0.3476, lng: 32.5825 },
        investmentValue: p.investmentValueUSD || 0,
        plannedEmployment: (p.employmentLocal || 0) + (p.employmentForeign || 0),
        status: mapSanityStatus(p.status),
        country: p.nationality || 'Uganda',
        industrialPark: p.industrialParkName,
        startDate: p.licenseDate || '',
        licenseNumber: p.referenceNumber,
      }));

      setData(mapped);
      setError(null);
    } catch (err) {
      console.error('[useProjects] fetch failed, using mock:', err);
      setData(mockProjects);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { data, loading, error, refresh: fetchProjects };
}
