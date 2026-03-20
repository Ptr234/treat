'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard, type RefreshInterval } from '@/hooks/useDashboard';
import type { DGActivity, AlertSeverity } from '@/types';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

type AlertFilter = 'all' | 'critical' | 'high' | 'medium';
type ScorecardSortKey = 'score' | 'activeCases' | 'resolvedToday' | 'slaCompliance' | 'acronym';
type SortDir = 'asc' | 'desc';

// ── Persistent alert acknowledgment ─────────────────────────────────

const ACK_STORAGE_KEY = 'osc-dashboard-acked-alerts';

function loadAckedAlerts(): Set<string> {
  try {
    const raw = localStorage.getItem(ACK_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveAckedAlerts(ids: Set<string>) {
  try {
    localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Never';
  const diffS = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffS < 5) return 'Just now';
  if (diffS < 60) return `${diffS}s ago`;
  return `${Math.floor(diffS / 60)}m ago`;
}

// ── Component ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const {
    metrics, delta, loading, error, isLive,
    lastUpdated, refreshInterval, setRefreshInterval, refresh,
  } = useDashboard();

  // Scorecard sort
  const [scorecardSort, setScorecardSort] = useState<ScorecardSortKey>('score');
  const [scorecardDir, setScorecardDir] = useState<SortDir>('desc');

  // Executive action state
  const [actionModal, setActionModal] = useState<'flag' | 'message' | 'review' | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Tick for last-updated display
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  // Load persisted acknowledged alerts
  useEffect(() => {
    setAcknowledgedAlerts(loadAckedAlerts());
  }, []);

  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => setActionSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess]);

  // ── Executive action handlers ──────────────────────────────────────

  const handleFlagCase = async () => {
    if (!actionInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${actionInput.trim()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEscalated: true, priority: 'critical' }),
      });
      if (res.ok) {
        setActionSuccess(`Ticket ${actionInput.trim()} flagged as priority case`);
        setActionModal(null);
        setActionInput('');
        refresh();
      } else {
        const data = await res.json();
        setActionSuccess(`Error: ${data.error || 'Failed to flag ticket'}`);
      }
    } catch {
      setActionSuccess('Network error — could not flag ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!actionInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'general',
          content: actionInput.trim(),
          senderAgencyCode: 'UIA',
        }),
      });
      if (res.ok) {
        setActionSuccess('Team message sent successfully');
        setActionModal(null);
        setActionInput('');
      }
    } catch {
      setActionSuccess('Network error — could not send message');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!metrics) return;
    const lines = ['Metric,Value'];
    lines.push(`Live Inquiries,${metrics.liveInquiries}`);
    lines.push(`Active Cases,${metrics.activeCases}`);
    lines.push(`Pending Approvals,${metrics.pendingApprovals}`);
    lines.push(`Pipeline Value (USD B),${(metrics.pipelineValue ?? 0).toFixed(1)}`);
    lines.push(`Response Rate,${metrics.responseRate}%`);
    lines.push(`Conversion Rate,${metrics.conversionRate}%`);
    lines.push(`SLA Compliance,${metrics.slaCompliance}%`);
    lines.push(`Investor Satisfaction,${metrics.investorSatisfaction}%`);
    lines.push('');
    lines.push('Agency,Score,Active Cases,Resolved Today,Avg Response,SLA Compliance');
    for (const a of (metrics.agencyScorecard ?? [])) {
      lines.push(`${a.acronym},${a.score},${a.activeCases},${a.resolvedToday},${a.avgResponseTime},${a.slaCompliance}%`);
    }
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setActionSuccess('Report downloaded');
  };

  const handleScheduleReview = async () => {
    if (!actionInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'general',
          content: `Review Scheduled: ${actionInput.trim()}\n\nRequested by Director General on ${new Date().toLocaleDateString('en-GB')}`,
          senderAgencyCode: 'UIA',
        }),
      });
      if (res.ok) {
        setActionSuccess('Review scheduled and team notified');
        setActionModal(null);
        setActionInput('');
      }
    } catch {
      setActionSuccess('Network error — could not schedule review');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Alert acknowledgment (persisted) ───────────────────────────────

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev).add(alertId);
      saveAckedAlerts(next);
      return next;
    });
  }, []);

  // ── Scorecard sorting ──────────────────────────────────────────────

  const handleScorecardSort = (key: ScorecardSortKey) => {
    if (scorecardSort === key) {
      setScorecardDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setScorecardSort(key);
      setScorecardDir(key === 'acronym' ? 'asc' : 'desc');
    }
  };

  const sortedScorecard = useMemo(() => {
    const list = [...(metrics?.agencyScorecard ?? [])];
    list.sort((a, b) => {
      let cmp: number;
      switch (scorecardSort) {
        case 'acronym': cmp = a.acronym.localeCompare(b.acronym); break;
        case 'score': cmp = a.score - b.score; break;
        case 'activeCases': cmp = a.activeCases - b.activeCases; break;
        case 'resolvedToday': cmp = a.resolvedToday - b.resolvedToday; break;
        case 'slaCompliance': cmp = a.slaCompliance - b.slaCompliance; break;
        default: cmp = 0;
      }
      return scorecardDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [metrics?.agencyScorecard, scorecardSort, scorecardDir]);

  // ── Guards ─────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Director General Dashboard</h1>
          <p className="text-gray-600 mb-6">
            This dashboard requires Director General authorization to access live operational data and executive controls.
          </p>
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors shadow-md hover:shadow-lg"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No dashboard data available yet.</p>
          <button onClick={refresh} className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800">Refresh</button>
        </div>
      </div>
    );
  }

  const alerts = metrics.alerts ?? [];
  const recentActivity = metrics.recentActivity ?? [];

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === 'all') return true;
    return alert.severity === alertFilter;
  });

  const unacknowledgedCount = alerts.filter(
    (a) => !a.acknowledged && !acknowledgedAlerts.has(a.id)
  ).length;

  // ── Sub-components & helpers ────────────────────────────────────────

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'high': return <BellAlertIcon className="w-5 h-5 text-orange-600" />;
      case 'medium': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'low': return <CheckCircleIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-red-600 bg-red-50';
      case 'high': return 'border-l-4 border-orange-600 bg-orange-50';
      case 'medium': return 'border-l-4 border-yellow-600 bg-yellow-50';
      case 'low': return 'border-l-4 border-yellow-600 bg-yellow-50';
    }
  };

  const getActivityColor = (type: DGActivity['type']) => {
    switch (type) {
      case 'inquiry': return 'bg-blue-500';
      case 'approval': return 'bg-yellow-500';
      case 'escalation': return 'bg-orange-500';
      case 'resolution': return 'bg-purple-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 70) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const TrendBadge = ({ value, suffix = '' }: { value: number | undefined; suffix?: string }) => {
    if (value === undefined || value === 0) return null;
    const isUp = value > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
        {isUp ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
        {isUp ? '+' : ''}{value}{suffix}
      </span>
    );
  };

  const SortIcon = ({ column }: { column: ScorecardSortKey }) => {
    if (scorecardSort !== column) return <ChevronUpDownIcon className="w-3.5 h-3.5 text-gray-400" />;
    return scorecardDir === 'desc'
      ? <ChevronDownIcon className="w-3.5 h-3.5 text-yellow-600" />
      : <ChevronUpIcon className="w-3.5 h-3.5 text-yellow-600" />;
  };

  const CircularProgress = ({ value, label, progressDelta }: { value: number; label: string; progressDelta?: number }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (value / 100) * circumference;
    const strokeColor = value >= 90 ? '#22c55e' : value >= 70 ? '#eab308' : '#ef4444';

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle
              cx="56" cy="56" r="40"
              stroke={strokeColor}
              strokeWidth="8" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-2xl font-bold text-gray-900">{value}%</span>
            {progressDelta !== undefined && progressDelta !== 0 && (
              <span className={`text-[10px] font-semibold ${progressDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {progressDelta > 0 ? '+' : ''}{progressDelta}%
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 font-medium mt-2 text-center">{label}</p>
      </div>
    );
  };

  const INTERVAL_OPTIONS: { value: RefreshInterval; label: string }[] = [
    { value: 30_000, label: '30s' },
    { value: 60_000, label: '1m' },
    { value: 300_000, label: '5m' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Director General Dashboard</h1>
                <span className="animate-ping-slow w-3 h-3 bg-yellow-500 rounded-full" />
              </div>
              <p className="text-base sm:text-lg text-gray-600">Real-time operational overview and executive controls</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {error && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">API Error</span>
              )}

              {unacknowledgedCount > 0 && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white animate-pulse">
                  {unacknowledgedCount} alert{unacknowledgedCount > 1 ? 's' : ''}
                </span>
              )}

              <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${isLive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                <SignalIcon className="w-3.5 h-3.5" />
                {isLive ? 'Live Data' : 'Sample Data'}
              </span>

              {/* Refresh interval selector */}
              <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRefreshInterval(opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${refreshInterval === opt.value ? 'bg-yellow-500 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button onClick={refresh} className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors" title="Refresh dashboard">
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              </button>

              <span className="text-xs text-gray-400">Updated {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-medium">Live Inquiries</p>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{metrics.liveInquiries}</p>
              <TrendBadge value={delta?.liveInquiries} />
            </div>
            <p className="text-xs text-gray-400 mt-1">New + Assigned tickets</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium mb-2">Active Cases</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{metrics.activeCases}</p>
              <TrendBadge value={delta?.activeCases} />
            </div>
            <p className="text-xs text-gray-400 mt-1">In Progress + Pending + Assigned</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium mb-2">Pending Approvals</p>
            <div className="flex items-end gap-2">
              <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${metrics.pendingApprovals > 20 ? 'text-orange-600' : 'text-gray-900'}`}>
                {metrics.pendingApprovals}
              </p>
              <TrendBadge value={delta?.pendingApprovals} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Awaiting external response</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-medium">Escalated</p>
              {(metrics.escalatedCount ?? 0) > 0 && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${(metrics.escalatedCount ?? 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {metrics.escalatedCount ?? 0}
              </p>
              <TrendBadge value={delta?.escalatedCount} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Awaiting officer action</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 font-medium mb-2">Pipeline Value</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-700">${(metrics.pipelineValue ?? 0).toFixed(1)}B</p>
              {delta?.pipelineValue !== undefined && delta.pipelineValue !== 0 && (
                <TrendBadge value={Number(delta.pipelineValue.toFixed(2))} suffix="B" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Total licensed investment</p>
          </div>
        </div>

        {/* ── Escalated Tickets ───────────────────────────────────── */}
        {(metrics.escalatedTickets?.length ?? 0) > 0 && (
          <div className="bg-red-50 rounded-xl shadow-sm p-6 mb-8 border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              Escalated Tickets — Needs Assignment
            </h2>
            <div className="space-y-3">
              {metrics.escalatedTickets!.map((t) => (
                <div key={t.referenceNumber} className="flex items-center justify-between bg-white p-4 rounded-lg border border-red-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-red-700">{t.referenceNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        t.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{t.priority}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{t.status}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium truncate">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.contactName} &bull; Agency: {t.agency} &bull; Escalated {formatTimestamp(t.escalatedAt)}</p>
                  </div>
                  <Link href={`/tickets/${t.referenceNumber}`} className="ml-4 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">
                    Assign
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Performance Gauges + Agency Scorecard ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Gauges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CircularProgress value={metrics.responseRate} label="Response Rate" progressDelta={delta?.responseRate} />
              <CircularProgress value={metrics.conversionRate} label="Conversion Rate" />
              <CircularProgress value={metrics.slaCompliance} label="SLA Compliance" progressDelta={delta?.slaCompliance} />
              <CircularProgress value={metrics.investorSatisfaction} label="Satisfaction" />
            </div>
          </div>

          {/* Agency Scorecard (sortable) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agency Scorecard</h2>

            {/* Mobile card view */}
            <div className="lg:hidden space-y-3 max-h-[400px] overflow-y-auto">
              {sortedScorecard.slice(0, 9).map((agency) => (
                <div key={agency.acronym} className="border border-gray-200 rounded-lg p-3 hover:border-yellow-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{agency.acronym}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(agency.score)}`}>{agency.score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2">
                    <div className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(agency.score)}`} style={{ width: `${agency.score}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Active Cases</p>
                      <p className="font-medium text-gray-700">{agency.activeCases}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Resolved Today</p>
                      <p className="font-semibold text-yellow-700">{agency.resolvedToday}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Response</p>
                      <p className="font-medium text-gray-700">{agency.avgResponseTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SLA</p>
                      <p className="font-semibold text-gray-900">{agency.slaCompliance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view (sortable) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-2">
                      <button onClick={() => handleScorecardSort('acronym')} className="font-semibold text-gray-700 flex items-center gap-1 hover:text-yellow-700 transition-colors">
                        Agency <SortIcon column="acronym" />
                      </button>
                    </th>
                    <th className="pb-2 text-center">
                      <button onClick={() => handleScorecardSort('score')} className="font-semibold text-gray-700 flex items-center gap-1 mx-auto hover:text-yellow-700 transition-colors">
                        Score <SortIcon column="score" />
                      </button>
                    </th>
                    <th className="pb-2 text-center">
                      <button onClick={() => handleScorecardSort('activeCases')} className="font-semibold text-gray-700 flex items-center gap-1 mx-auto hover:text-yellow-700 transition-colors">
                        Active <SortIcon column="activeCases" />
                      </button>
                    </th>
                    <th className="pb-2 text-center">
                      <button onClick={() => handleScorecardSort('resolvedToday')} className="font-semibold text-gray-700 flex items-center gap-1 mx-auto hover:text-yellow-700 transition-colors">
                        Today <SortIcon column="resolvedToday" />
                      </button>
                    </th>
                    <th className="pb-2 text-right font-semibold text-gray-700">Avg Response</th>
                    <th className="pb-2 text-right">
                      <button onClick={() => handleScorecardSort('slaCompliance')} className="font-semibold text-gray-700 flex items-center gap-1 ml-auto hover:text-yellow-700 transition-colors">
                        SLA % <SortIcon column="slaCompliance" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedScorecard.slice(0, 9).map((agency) => (
                    <tr key={agency.acronym} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 font-medium text-gray-900">{agency.acronym}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2 justify-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(agency.score)}`}>{agency.score}</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full hidden xl:block">
                            <div className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(agency.score)}`} style={{ width: `${agency.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-gray-700">{agency.activeCases}</td>
                      <td className="py-2.5 text-center text-yellow-700 font-semibold">{agency.resolvedToday}</td>
                      <td className="py-2.5 text-right text-gray-700">{agency.avgResponseTime}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">{agency.slaCompliance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Alerts + Activity ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BellAlertIcon className="w-6 h-6 text-red-600" />
                Alerts Feed
                {unacknowledgedCount > 0 && (
                  <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {unacknowledgedCount}
                  </span>
                )}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['all', 'critical', 'high', 'medium'] as AlertFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAlertFilter(filter)}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-colors ${
                      alertFilter === filter ? 'bg-yellow-600 text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No {alertFilter === 'all' ? '' : alertFilter + ' '}alerts</div>
              )}
              {filteredAlerts.map((alert) => {
                const isAcknowledged = alert.acknowledged || acknowledgedAlerts.has(alert.id);
                return (
                  <div key={alert.id} className={`p-4 rounded-lg ${getSeverityColor(alert.severity)} ${isAcknowledged ? 'opacity-50' : ''} transition-opacity`}>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-3">
                          {!isAcknowledged && (
                            <button onClick={() => acknowledgeAlert(alert.id)} className="text-xs font-semibold text-yellow-700 hover:text-neutral-800 flex items-center gap-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              Acknowledge
                            </button>
                          )}
                          {alert.relatedTicketId && (
                            <Link href={`/tickets/${alert.relatedTicketId}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                              View Ticket
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
              Recent Activity
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`} />
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{activity.action}</p>
                    <p className="text-xs text-gray-600 mb-1">{activity.target}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{activity.actor}</p>
                      <span className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat Enquiries Link ─────────────────────────────────── */}
        <Link
          href="/dashboard/enquiries"
          className="block bg-white rounded-xl shadow-sm p-6 mb-8 hover:shadow-md transition-shadow border border-gray-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chat Enquiries</h3>
                <p className="text-sm text-gray-500">View AI chatbot conversations, user details, and sentiment analytics</p>
              </div>
            </div>
            <ArrowUpIcon className="w-5 h-5 text-gray-400 rotate-90 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* ── Executive Actions ────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-neutral-800 to-yellow-600 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Executive Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => { setActionModal('flag'); setActionInput(''); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3">
              <FlagIcon className="w-6 h-6" />
              <span className="font-semibold">Flag Priority Case</span>
            </button>
            <button onClick={() => { setActionModal('message'); setActionInput(''); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span className="font-semibold">Send Team Message</span>
            </button>
            <button onClick={handleGenerateReport} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6" />
              <span className="font-semibold">Generate Report</span>
            </button>
            <button onClick={() => { setActionModal('review'); setActionInput(''); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3">
              <CalendarIcon className="w-6 h-6" />
              <span className="font-semibold">Schedule Review</span>
            </button>
          </div>
        </div>

        {/* ── Action Modal ──────────────────────────────────────── */}
        {actionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {actionModal === 'flag' ? 'Flag Priority Case' : actionModal === 'message' ? 'Send Team Message' : 'Schedule Review'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {actionModal === 'flag'
                  ? 'Enter the ticket reference number (e.g. UIA-2026-0001):'
                  : actionModal === 'message'
                    ? 'Enter your message to broadcast to all agency officers:'
                    : 'Enter the review topic and any notes:'}
              </p>
              {actionModal === 'flag' ? (
                <input
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  placeholder="UIA-2026-0001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              ) : (
                <textarea
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  rows={4}
                  placeholder={actionModal === 'message' ? 'Type your message...' : 'Review topic and notes...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              )}
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => { setActionModal(null); setActionInput(''); }}
                  className="flex-1 px-4 py-2.5 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={actionModal === 'flag' ? handleFlagCase : actionModal === 'message' ? handleSendMessage : handleScheduleReview}
                  disabled={!actionInput.trim() || actionLoading}
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {actionLoading ? 'Processing...' : actionModal === 'flag' ? 'Flag Case' : actionModal === 'message' ? 'Send Message' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Success Toast ─────────────────────────────────────── */}
        {actionSuccess && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
