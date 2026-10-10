'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
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
  Cog6ToothIcon,
  UserGroupIcon,
  FlagIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SignalIcon,
  Squares2X2Icon,
  TicketIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type AlertFilter = 'all' | 'critical' | 'high' | 'medium';
type ScorecardSortKey = 'score' | 'activeCases' | 'resolvedToday' | 'slaCompliance' | 'acronym';
type SortDir = 'asc' | 'desc';

interface ManageItem {
  label: string;
  href: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Mirrors DashboardSidebar's groupings, so the home page and the nav agree.
const MANAGE_SECTIONS: { heading: string; items: ManageItem[] }[] = [
  {
    heading: 'Operations',
    items: [
      { label: 'Contact Inquiries', href: '/dashboard/inquiries', icon: DocumentTextIcon, description: 'Contact form submissions and support requests, by agency' },
      { label: 'Chat Enquiries', href: '/dashboard/enquiries', icon: ChatBubbleLeftRightIcon, description: 'AI chatbot conversations, user details, and sentiment' },
      { label: 'Investor Pipeline', href: '/dashboard/investors', icon: ArrowTrendingUpIcon, description: 'Registered investor profiles, status, and pipeline value' },
      { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon, description: 'Scheduled meetings, event registrations, and requests' },
      { label: 'Business Registrations', href: '/dashboard/business-registrations', icon: BuildingLibraryIcon, description: 'URSB registration reviews and filings' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Events', href: '/dashboard/events', icon: MegaphoneIcon, description: 'Forums, summits, and webinars on the public calendar' },
      { label: 'Agencies', href: '/dashboard/agencies', icon: BuildingOffice2Icon, description: 'Agency details, contacts, and service-level targets' },
      { label: 'Downloads', href: '/dashboard/downloads', icon: DocumentTextIcon, description: 'Forms, guides, and resources in the downloads library' },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { label: 'User Management', href: '/dashboard/users', icon: UserGroupIcon, description: 'Create, manage, and deactivate officers and team members' },
      { label: 'Escalation Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, description: 'Escalation recipients, default assignee, and messages' },
      { label: 'Audit Log', href: '/dashboard/audit', icon: ShieldCheckIcon, description: 'Full activity trail across the back office' },
    ],
  },
];

// ── Persistent alert acknowledgment ─────────────────────────────────

const ACK_STORAGE_KEY = 'osc-dashboard-acked-alerts';

/**
 * Pipeline capital, in the unit that suits its size. Always formatting in
 * billions turned a real $40M pipeline into "$0.0B", which reads as nothing at
 * all; anything under a billion is therefore shown in millions.
 */
function formatPipeline(valueInBillions: number): string {
  const usd = valueInBillions * 1_000_000_000;
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(2)}B`;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
  return '$0';
}

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
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const isAdmin = isAuthenticated && isAdminLevel(user?.role);
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
  const [reviewDate, setReviewDate] = useState('');
  const [reviewTime, setReviewTime] = useState('');
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
      const data = await apiFetch(`/api/tickets/${actionInput.trim()}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEscalated: true, priority: 'critical' }),
      });
      if (data.success) {
        setActionSuccess(`Ticket ${actionInput.trim()} flagged as priority case`);
        setActionModal(null);
        setActionInput('');
        refresh();
      } else {
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
      const result = await apiFetch('/api/messages/', {
        method: 'POST',
        body: JSON.stringify({
          channel: 'general',
          content: actionInput.trim(),
          senderAgencyCode: 'UIA',
        }),
      });
      if (result.success) {
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
    lines.push(`Pipeline Value (USD),${Math.round((metrics.pipelineValue ?? 0) * 1_000_000_000)}`);
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
    if (!actionInput.trim() || !reviewDate) return;
    setActionLoading(true);
    try {
      const dateLabel = new Date(`${reviewDate}T00:00:00`).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      const when = reviewTime ? `${dateLabel} at ${reviewTime}` : dateLabel;

      const result = await apiFetch('/api/messages/', {
        method: 'POST',
        body: JSON.stringify({
          channel: 'general',
          content: `📅 Review scheduled for ${when}\n\n${actionInput.trim()}\n\nRequested by Director General on ${new Date().toLocaleDateString('en-GB')}`,
          senderAgencyCode: 'UIA',
        }),
      });
      if (result.success) {
        setActionSuccess(`Review scheduled for ${when} — team notified`);
        setActionModal(null);
        setActionInput('');
        setReviewDate('');
        setReviewTime('');
      } else {
        setActionSuccess(`Error: ${result.error || 'Failed to schedule review'}`);
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

  // While the session is being verified, show a loader instead of briefly
  // flashing the "access denied" screen to an admin who is in fact authorized.
  if (authLoading) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black mx-auto mb-4" />
          <p className="text-neutral-700 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center bg-white border border-neutral-200 shadow-sm rounded-sm p-8">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-5">
            <LockClosedIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-black mb-3">Director General Dashboard</h1>
          <p className="text-neutral-700 mb-6">
            This dashboard requires Director General authorization to access live operational data and executive controls.
          </p>
          <Link
            href="/"
            className="gov-btn w-full"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black mx-auto mb-4" />
          <p className="text-neutral-700 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-700 font-medium">No dashboard data available yet.</p>
          <button onClick={refresh} className="gov-btn gov-btn--sm mt-4">Refresh</button>
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

  // Severity/activity/score colors keep to the brand palette: red reads as
  // the one alarming color, gold as "needs attention", black/neutral as
  // routine — the classic ledger convention (black = in good standing, red
  // = in the red) stands in for the generic green/blue/orange/purple set
  // a default component library would reach for.
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5 text-red-700" />;
      case 'high': return <BellAlertIcon className="w-5 h-5 text-red-600" />;
      case 'medium': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-700" />;
      case 'low': return <CheckCircleIcon className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-red-700 bg-red-50';
      case 'high': return 'border-l-4 border-red-300 bg-red-50/50';
      case 'medium': return 'border-l-4 border-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-4 border-neutral-300 bg-neutral-50';
    }
  };

  const getActivityColor = (type: DGActivity['type']) => {
    switch (type) {
      case 'inquiry': return 'bg-black';
      case 'approval': return 'bg-yellow-500';
      case 'escalation': return 'bg-red-600';
      case 'resolution': return 'bg-neutral-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-black bg-neutral-100 ring-1 ring-inset ring-neutral-300';
    if (score >= 70) return 'text-black bg-yellow-100';
    return 'text-white bg-red-700';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-black';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const TrendBadge = ({ value, suffix = '' }: { value: number | undefined; suffix?: string }) => {
    if (value === undefined || value === 0) return null;
    const isUp = value > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-black' : 'text-red-700'}`}>
        {isUp ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
        {isUp ? '+' : ''}{value}{suffix}
      </span>
    );
  };

  const SortIcon = ({ column }: { column: ScorecardSortKey }) => {
    if (scorecardSort !== column) return <ChevronUpDownIcon className="w-3.5 h-3.5 text-neutral-500" />;
    return scorecardDir === 'desc'
      ? <ChevronDownIcon className="w-3.5 h-3.5 text-red-600" />
      : <ChevronUpIcon className="w-3.5 h-3.5 text-red-600" />;
  };

  const CircularProgress = ({ value, label, progressDelta }: { value: number; label: string; progressDelta?: number }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (value / 100) * circumference;
    const strokeColor = value >= 90 ? '#000000' : value >= 70 ? '#FFD700' : '#CE1126';

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
            <span className="text-lg sm:text-2xl font-bold text-black">{value}%</span>
            {progressDelta !== undefined && progressDelta !== 0 && (
              <span className={`text-[10px] font-semibold ${progressDelta > 0 ? 'text-black' : 'text-red-700'}`}>
                {progressDelta > 0 ? '+' : ''}{progressDelta}%
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-neutral-800 font-medium mt-2 text-center">{label}</p>
      </div>
    );
  };

  const INTERVAL_OPTIONS: { value: RefreshInterval; label: string }[] = [
    { value: 30_000, label: '30s' },
    { value: 60_000, label: '1m' },
    { value: 300_000, label: '5m' },
  ];

  return (
 <div className="min-h-screen bg-[#f5f3ee] py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="mb-8 border-b-2 border-black pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="gov-kicker">Executive overview</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-black lg:text-4xl">Director General dashboard</h1>
              <p className="mt-2 text-base sm:text-lg text-neutral-600">Real-time operational overview and executive controls</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {error && (
                <span className="gov-tag gov-tag--red">API error</span>
              )}

              {unacknowledgedCount > 0 && (
                <span className="px-3 py-1 text-xs font-bold bg-red-700 text-white animate-pulse">
                  {unacknowledgedCount} alert{unacknowledgedCount > 1 ? 's' : ''}
                </span>
              )}

              <span className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border ${isLive ? 'bg-black text-yellow-400 border-black' : 'bg-yellow-50 text-black border-yellow-300'}`}>
                <SignalIcon className="w-3.5 h-3.5" />
                {isLive ? 'Live Data' : 'Sample Data'}
              </span>

              {/* Refresh interval selector */}
              <div className="inline-flex items-center border border-neutral-300 divide-x divide-neutral-300 overflow-hidden">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRefreshInterval(opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${refreshInterval === opt.value ? 'bg-black text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button onClick={refresh} className="p-2 bg-white border border-neutral-300 hover:bg-neutral-50 hover:border-black transition-colors" title="Refresh dashboard">
                <ArrowPathIcon className="w-5 h-5 text-neutral-700" />
              </button>

              <span className="text-xs text-neutral-500">Updated {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* ── Quick Links ────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
              { label: 'Agency Chat', href: '/agency-chat', icon: ChatBubbleLeftRightIcon },
              { label: 'Tickets', href: '/tickets', icon: TicketIcon },
              { label: 'Audit Trail', href: '/dashboard/audit', icon: ShieldCheckIcon },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-sm font-semibold text-neutral-800 hover:border-black hover:text-red-700 transition-all"
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-white border border-neutral-200 border-t-4 border-t-yellow-400 shadow-sm hover:shadow-md p-6 transition-shadow">
            <p className="text-sm text-neutral-600 font-medium mb-2">Live Inquiries</p>
            <div className="flex items-end gap-2">
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{metrics.liveInquiries}</p>
              <TrendBadge value={delta?.liveInquiries} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">New + Assigned tickets</p>
          </div>

          <div className="bg-white border border-neutral-200 border-t-4 border-t-yellow-400 shadow-sm hover:shadow-md p-6 transition-shadow">
            <p className="text-sm text-neutral-600 font-medium mb-2">Active Cases</p>
            <div className="flex items-end gap-2">
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{metrics.activeCases}</p>
              <TrendBadge value={delta?.activeCases} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">In Progress + Pending + Assigned</p>
          </div>

          <div className={`bg-white border border-neutral-200 border-t-4 shadow-sm hover:shadow-md p-6 transition-shadow ${metrics.pendingApprovals > 20 ? 'border-t-red-600' : 'border-t-yellow-400'}`}>
            <p className="text-sm text-neutral-600 font-medium mb-2">Pending Approvals</p>
            <div className="flex items-end gap-2">
              <p className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold ${metrics.pendingApprovals > 20 ? 'text-red-700' : 'text-black'}`}>
                {metrics.pendingApprovals}
              </p>
              <TrendBadge value={delta?.pendingApprovals} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Awaiting external response</p>
          </div>

          <div className={`bg-white border border-neutral-200 border-t-4 shadow-sm hover:shadow-md p-6 transition-shadow ${(metrics.escalatedCount ?? 0) > 0 ? 'border-t-red-600' : 'border-t-yellow-400'}`}>
            <p className="text-sm text-neutral-600 font-medium mb-2">Escalated</p>
            <div className="flex items-end gap-2">
              <p className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold ${(metrics.escalatedCount ?? 0) > 0 ? 'text-red-700' : 'text-black'}`}>
                {metrics.escalatedCount ?? 0}
              </p>
              <TrendBadge value={delta?.escalatedCount} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Awaiting officer action</p>
          </div>

          <div className="bg-white border border-neutral-200 border-t-4 border-t-black shadow-sm hover:shadow-md p-6 transition-shadow">
            <p className="text-sm text-neutral-600 font-medium mb-2">Pipeline Value</p>
            <div className="flex items-end gap-2">
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                {formatPipeline(metrics.pipelineValue ?? 0)}
              </p>
              {delta?.pipelineValue !== undefined && delta.pipelineValue !== 0 && (
                <TrendBadge value={Number((delta.pipelineValue * 1000).toFixed(1))} suffix="M" />
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Capital in the investor pipeline</p>
          </div>
        </div>

        {/* ── Escalated Tickets ───────────────────────────────────── */}
        {(metrics.escalatedTickets?.length ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 shadow-sm p-6 mb-8">
            <h2 className="font-display text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-700" />
              Escalated Tickets — Needs Assignment
            </h2>
            <div className="space-y-3">
              {metrics.escalatedTickets!.map((t) => (
                <div key={t.referenceNumber} className="flex items-center justify-between bg-white border border-red-100 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-red-700">{t.referenceNumber}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase ${
                        t.priority === 'critical' ? 'bg-red-700 text-white' :
                        t.priority === 'high' ? 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200' :
                        'bg-yellow-100 text-black'
                      }`}>{t.priority}</span>
                      <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-700">{t.status}</span>
                    </div>
                    <p className="text-sm text-black font-medium truncate">{t.title}</p>
                    <p className="text-xs text-neutral-600 mt-1">{t.contactName} &bull; Agency: {t.agency} &bull; Escalated {formatTimestamp(t.escalatedAt)}</p>
                  </div>
                  <Link href={`/tickets/${t.referenceNumber}`} className="gov-btn gov-btn--sm ml-4 flex-shrink-0">
                    Assign
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Performance Gauges + Agency Scorecard ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-neutral-200 shadow-sm p-6">
            <h2 className="font-display text-xl font-bold text-black mb-6">Performance Gauges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CircularProgress value={metrics.responseRate} label="Response Rate" progressDelta={delta?.responseRate} />
              <CircularProgress value={metrics.conversionRate} label="Conversion Rate" />
              <CircularProgress value={metrics.slaCompliance} label="SLA Compliance" progressDelta={delta?.slaCompliance} />
              <CircularProgress value={metrics.investorSatisfaction} label="Satisfaction" />
            </div>
          </div>

          {/* Agency Scorecard (sortable) */}
          <div className="bg-white border border-neutral-200 shadow-sm p-4 sm:p-6">
            <h2 className="font-display text-xl font-bold text-black mb-4">Agency Scorecard</h2>

            {/* Mobile card view */}
            <div className="lg:hidden space-y-3 max-h-[400px] overflow-y-auto">
              {sortedScorecard.slice(0, 9).map((agency) => (
                <div key={agency.acronym} className="border border-neutral-200 p-3 hover:border-black transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-black">{agency.acronym}</span>
                    <span className={`px-2 py-1 text-xs font-bold ${getScoreColor(agency.score)}`}>{agency.score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-2">
                    <div className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(agency.score)}`} style={{ width: `${agency.score}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-neutral-600">Active Cases</p>
                      <p className="font-medium text-neutral-800">{agency.activeCases}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Resolved Today</p>
                      <p className="font-semibold text-black">{agency.resolvedToday}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Avg Response</p>
                      <p className="font-medium text-neutral-800">{agency.avgResponseTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">SLA</p>
                      <p className="font-semibold text-black">{agency.slaCompliance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view (sortable) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200">
                  <tr className="text-left">
                    <th className="pb-2">
                      <button onClick={() => handleScorecardSort('acronym')} className="font-semibold text-neutral-800 flex items-center gap-1 hover:text-red-600 transition-colors">
                        Agency <SortIcon column="acronym" />
                      </button>
                    </th>
                    <th className="pb-2 text-center">
                      <button onClick={() => handleScorecardSort('score')} className="font-semibold text-neutral-800 flex items-center gap-1 mx-auto hover:text-red-600 transition-colors">
                        Score <SortIcon column="score" />
                      </button>
                    </th>
                    <th className="pb-2 text-center">
                      <button onClick={() => handleScorecardSort('activeCases')} className="font-semibold text-neutral-800 flex items-center gap-1 mx-auto hover:text-red-600 transition-colors">
                        Active <SortIcon column="activeCases" />
                      </button>
                    </th>
                    <th className="pb-2 text-center">
                      <button onClick={() => handleScorecardSort('resolvedToday')} className="font-semibold text-neutral-800 flex items-center gap-1 mx-auto hover:text-red-600 transition-colors">
                        Today <SortIcon column="resolvedToday" />
                      </button>
                    </th>
                    <th className="pb-2 text-right font-semibold text-neutral-800">Avg Response</th>
                    <th className="pb-2 text-right">
                      <button onClick={() => handleScorecardSort('slaCompliance')} className="font-semibold text-neutral-800 flex items-center gap-1 ml-auto hover:text-red-600 transition-colors">
                        SLA % <SortIcon column="slaCompliance" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedScorecard.slice(0, 9).map((agency) => (
                    <tr key={agency.acronym} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 font-medium text-black">{agency.acronym}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2 justify-center">
                          <span className={`px-2 py-1 text-xs font-bold ${getScoreColor(agency.score)}`}>{agency.score}</span>
                          <div className="w-16 h-1.5 bg-neutral-100 rounded-full hidden xl:block">
                            <div className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(agency.score)}`} style={{ width: `${agency.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-neutral-800">{agency.activeCases}</td>
                      <td className="py-2.5 text-center text-black font-semibold">{agency.resolvedToday}</td>
                      <td className="py-2.5 text-right text-neutral-800">{agency.avgResponseTime}</td>
                      <td className="py-2.5 text-right font-semibold text-black">{agency.slaCompliance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Alerts + Activity ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-black flex items-center gap-2">
                <BellAlertIcon className="w-6 h-6 text-red-700" />
                Alerts Feed
                {unacknowledgedCount > 0 && (
                  <span className="min-w-[22px] h-[22px] px-1.5 bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                    {unacknowledgedCount}
                  </span>
                )}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['all', 'critical', 'high', 'medium'] as AlertFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAlertFilter(filter)}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold transition-colors ${
                      alertFilter === filter ? 'bg-yellow-400 text-black' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-neutral-500 text-sm">No {alertFilter === 'all' ? '' : alertFilter + ' '}alerts</div>
              )}
              {filteredAlerts.map((alert) => {
                const isAcknowledged = alert.acknowledged || acknowledgedAlerts.has(alert.id);
                return (
                  <div key={alert.id} className={`p-4 ${getSeverityColor(alert.severity)} ${isAcknowledged ? 'opacity-50' : ''} transition-opacity`}>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-black text-sm">{alert.title}</h3>
                          <span className="text-xs text-neutral-600 flex-shrink-0 ml-2">{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        <p className="text-sm text-neutral-800 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-3">
                          {!isAcknowledged && (
                            <button onClick={() => acknowledgeAlert(alert.id)} className="text-xs font-semibold text-red-700 hover:text-black flex items-center gap-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              Acknowledge
                            </button>
                          )}
                          {alert.relatedTicketId && (
                            <Link href={`/tickets/${alert.relatedTicketId}`} className="text-xs font-semibold text-black underline underline-offset-2 hover:text-red-700 flex items-center gap-1">
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

          <div className="bg-white border border-neutral-200 shadow-sm p-6">
            <h2 className="font-display text-xl font-bold text-black mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-red-700" />
              Recent Activity
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`} />
                    <div className="w-0.5 h-full bg-neutral-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-semibold text-black mb-1">{activity.action}</p>
                    <p className="text-xs text-neutral-700 mb-1">{activity.target}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-neutral-600">{activity.actor}</p>
                      <span className="text-xs text-neutral-500">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Engagement Stats ──────────────────────────────────── */}
        <div className="bg-white border border-neutral-200 shadow-sm p-6 mb-8">
          <h2 className="font-display text-lg font-bold text-black mb-4">Platform Engagement (Last 30 Days)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Inquiries', value: metrics.totalInquiries ?? 0, recent: metrics.recentInquiries, color: 'text-black' },
              { label: 'Appointments', value: metrics.totalAppointments ?? 0, recent: metrics.recentAppointments, color: 'text-black' },
              { label: 'Escalations', value: metrics.chatEscalations ?? 0, color: 'text-red-700' },
              { label: 'Messages', value: metrics.totalMessages ?? 0, recent: metrics.recentMessages, color: 'text-black' },
              { label: 'Tool Uses', value: metrics.toolUsageCount ?? 0, color: 'text-black' },
              { label: 'Downloads', value: metrics.downloadCount ?? 0, color: 'text-neutral-700' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 bg-neutral-50 border border-neutral-100">
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-neutral-600 mt-1">{stat.label}</p>
                {stat.recent !== undefined && stat.recent > 0 && (
                  <p className="text-xs text-neutral-500 mt-0.5">+{stat.recent} this month</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Manage ──────────────────────────────────────────────── */}
        {MANAGE_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-8">
            <h2 className="font-display text-lg font-bold text-black mb-4 flex items-center gap-2">
              <span className="h-3.5 w-3.5 bg-yellow-400" aria-hidden="true" />
              {section.heading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-4 bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-black p-5 transition-all"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-black text-yellow-400 group-hover:bg-red-700 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-black">{item.label}</h3>
                      <p className="mt-1 text-xs leading-5 text-neutral-600">{item.description}</p>
                    </div>
                    <ArrowUpIcon className="mt-1 h-4 w-4 shrink-0 rotate-90 text-neutral-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Executive Actions ────────────────────────────────────── */}
        <div className="bg-black p-6 mb-8">
          <h2 className="font-display text-xl font-bold text-white mb-4">Executive Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => { setActionModal('flag'); setActionInput(''); }} className="bg-white/10 hover:bg-yellow-400 hover:text-black text-white p-4 transition-colors flex items-center gap-3">
              <FlagIcon className="w-6 h-6" />
              <span className="font-semibold">Flag Priority Case</span>
            </button>
            <button onClick={() => { setActionModal('message'); setActionInput(''); }} className="bg-white/10 hover:bg-yellow-400 hover:text-black text-white p-4 transition-colors flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span className="font-semibold">Send Team Message</span>
            </button>
            <button onClick={handleGenerateReport} className="bg-white/10 hover:bg-yellow-400 hover:text-black text-white p-4 transition-colors flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6" />
              <span className="font-semibold">Generate Report</span>
            </button>
            <button onClick={() => { setActionModal('review'); setActionInput(''); setReviewDate(''); setReviewTime(''); }} className="bg-white/10 hover:bg-yellow-400 hover:text-black text-white p-4 transition-colors flex items-center gap-3">
              <CalendarIcon className="w-6 h-6" />
              <span className="font-semibold">Schedule Review</span>
            </button>
          </div>
        </div>

        {/* ── Action Modal ──────────────────────────────────────── */}
        {actionModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="max-w-md w-full bg-white shadow-2xl border-t-4 border-t-yellow-400 p-4 sm:p-6 max-h-[85vh] overflow-y-auto animate-scale-in">
              <h3 className="font-display text-lg font-bold text-black mb-2">
                {actionModal === 'flag' ? 'Flag Priority Case' : actionModal === 'message' ? 'Send Team Message' : 'Schedule Review'}
              </h3>
              <p className="text-sm text-neutral-700 mb-4">
                {actionModal === 'flag'
                  ? 'Enter the ticket reference number (e.g. UIA-2026-0001):'
                  : actionModal === 'message'
                    ? 'Enter your message to broadcast to all agency officers:'
                    : 'Pick a date and time, then add the review topic and any notes:'}
              </p>
              {actionModal === 'review' && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={reviewDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setReviewDate(e.target.value)}
                      className="gov-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Time (optional)</label>
                    <input
                      type="time"
                      value={reviewTime}
                      onChange={(e) => setReviewTime(e.target.value)}
                      className="gov-input"
                    />
                  </div>
                </div>
              )}
              {actionModal === 'flag' ? (
                <input
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  placeholder="UIA-2026-0001"
                  className="gov-input"
                />
              ) : (
                <textarea
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  rows={4}
                  placeholder={actionModal === 'message' ? 'Type your message...' : 'Review topic and notes...'}
                  className="gov-input"
                />
              )}
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => { setActionModal(null); setActionInput(''); setReviewDate(''); setReviewTime(''); }}
                  className="flex-1 px-4 py-2.5 min-h-[44px] border border-neutral-400 text-neutral-800 hover:bg-neutral-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={actionModal === 'flag' ? handleFlagCase : actionModal === 'message' ? handleSendMessage : handleScheduleReview}
                  disabled={!actionInput.trim() || actionLoading || (actionModal === 'review' && !reviewDate)}
                  className="gov-btn flex-1"
                >
                  {actionLoading ? 'Processing...' : actionModal === 'flag' ? 'Flag Case' : actionModal === 'message' ? 'Send Message' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Success Toast ─────────────────────────────────────── */}
        {actionSuccess && (
          <div className="fixed bottom-6 right-6 bg-black text-yellow-400 border-l-4 border-l-yellow-400 px-6 py-3 shadow-2xl z-50 animate-slide-up">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
