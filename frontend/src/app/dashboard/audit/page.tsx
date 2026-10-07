'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { apiFetch } from '@/lib/api-client';
import { ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, type BadgeTone } from '@/components/dashboard/ui';

interface AuditEntry {
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details?: string | null;
  statusCode: number;
  ipAddress?: string | null;
}

function statusTone(code: number): BadgeTone {
  if (code >= 200 && code < 300) return 'green';
  if (code === 401 || code === 403) return 'red';
  if (code >= 400) return 'amber';
  return 'neutral';
}

export default function AuditPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const isAdmin = isAuthenticated && isAdminLevel(user?.role);

  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ from: '0', to: '100' });
    if (actor.trim()) params.set('actor', actor.trim());
    if (action.trim()) params.set('action', action.trim());
    try {
      const res = await apiFetch<{ items: AuditEntry[]; total: number }>(`/api/audit?${params.toString()}`);
      if (res.success && res.data) {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [actor, action]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (authLoading) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="p-8 max-w-md w-full text-center border-t border-neutral-200 pt-5">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-3">Audit Trail</h1>
          <p className="text-neutral-700 mb-6">This page requires administrator access.</p>
          <Link href="/" className="inline-block w-full px-6 py-3 bg-black text-yellow-400 font-semibold rounded-md hover:bg-neutral-100">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Audit Trail"
          subtitle={`Append-only record of privileged and state-changing actions (${total} entries).`}
          actions={
            <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-800 hover:bg-neutral-50">
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Filter by actor email…"
            aria-label="Filter by actor email"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus-visible:ring-red-600 focus:border-transparent"
          />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter by action (e.g. tickets, login)…"
            aria-label="Filter by action"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus-visible:ring-red-600 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto border-t border-neutral-200 pt-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-600 border-b border-neutral-200">
                <th scope="col" className="px-4 py-3 font-semibold">Time</th>
                <th scope="col" className="px-4 py-3 font-semibold">Actor</th>
                <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                <th scope="col" className="px-4 py-3 font-semibold">Details</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-700">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-700">No audit entries match.</td></tr>
              )}
              {!loading && items.map((e, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">{new Date(e.timestamp).toLocaleString('en-GB')}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-900">{e.actorEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">{e.actorRole}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-neutral-800">{e.action}</td>
                  <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{e.details}</td>
                  <td className="px-4 py-3"><StatusBadge tone={statusTone(e.statusCode)}>{e.statusCode}</StatusBadge></td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-700 text-xs">{e.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
