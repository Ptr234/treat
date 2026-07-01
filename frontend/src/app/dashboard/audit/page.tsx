'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import { ArrowPathIcon, ArrowLeftIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AuditEntry {
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details?: string | null;
  statusCode: number;
  ipAddress?: string | null;
}

function statusClass(code: number) {
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-800';
  if (code === 401 || code === 403) return 'bg-red-100 text-red-800';
  if (code >= 400) return 'bg-yellow-100 text-yellow-800';
  return 'bg-neutral-100 text-neutral-700';
}

export default function AuditPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Audit Trail</h1>
          <p className="text-gray-600 mb-6">This page requires administrator access.</p>
          <Link href="/" className="inline-block w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheckIcon className="w-7 h-7 text-yellow-600" /> Audit Trail
            </h1>
            <p className="text-gray-600 mt-1">Append-only record of privileged and state-changing actions ({total} entries).</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-neutral-50 self-start">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Filter by actor email…"
            aria-label="Filter by actor email"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter by action (e.g. tickets, login)…"
            aria-label="Filter by action"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
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
                <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">No audit entries match.</td></tr>
              )}
              {!loading && items.map((e, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">{new Date(e.timestamp).toLocaleString('en-GB')}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-900">{e.actorEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">{e.actorRole}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-neutral-800">{e.action}</td>
                  <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{e.details}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(e.statusCode)}`}>{e.statusCode}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-400 text-xs">{e.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
