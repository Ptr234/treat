'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { DGActivity, AlertSeverity } from '@/types';
import {
  ArrowPathIcon,
  ArrowUpIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

type AlertFilter = 'all' | 'critical' | 'high' | 'medium';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const { metrics, loading, error, isLive, refresh } = useDashboard();

  // Executive action state
  const [actionModal, setActionModal] = useState<'flag' | 'message' | 'review' | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => setActionSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess]);

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-strong p-8 max-w-md w-full text-center">
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
  const agencyScorecard = metrics.agencyScorecard ?? [];
  const recentActivity = metrics.recentActivity ?? [];

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === 'all') return true;
    return alert.severity === alertFilter;
  });

  const acknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlerts((prev) => new Set(prev).add(alertId));
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'high':
        return <BellAlertIcon className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircleIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-red-600 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-600 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-yellow-600 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-yellow-600 bg-yellow-50';
    }
  };

  const getActivityColor = (type: DGActivity['type']) => {
    switch (type) {
      case 'inquiry':
        return 'bg-blue-500';
      case 'approval':
        return 'bg-yellow-500';
      case 'escalation':
        return 'bg-orange-500';
      case 'resolution':
        return 'bg-purple-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-700 bg-yellow-100';
    if (score >= 70) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const CircularProgress = ({ value, label }: { value: number; label: string }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke="#22c55e"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{value}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 font-medium mt-2 text-center">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Director General Dashboard</h1>
                <span className="animate-ping-slow w-3 h-3 bg-yellow-500 rounded-full" />
              </div>
              <p className="text-lg text-gray-600">Real-time operational overview and executive controls</p>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  API Error
                </span>
              )}
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  isLive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {isLive ? 'Live Data' : 'Sample Data'}
              </span>
              <button
                onClick={refresh}
                className="p-2 rounded-lg bg-white shadow-soft hover:bg-gray-50 transition-colors"
                title="Refresh dashboard"
              >
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-medium">Live Inquiries</p>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">{metrics.liveInquiries}</p>
            <div className="flex items-center text-sm text-yellow-600">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              <span className="font-semibold">12.5%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <p className="text-sm text-gray-500 font-medium mb-2">Active Cases</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{metrics.activeCases}</p>
            <div className="flex items-center text-sm text-yellow-600">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              <span className="font-semibold">8.3%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <p className="text-sm text-gray-500 font-medium mb-2">Pending Approvals</p>
            <p className={`text-4xl font-bold mb-2 ${metrics.pendingApprovals > 20 ? 'text-orange-600' : 'text-gray-900'}`}>
              {metrics.pendingApprovals}
            </p>
            <div className="flex items-center text-sm text-red-600">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              <span className="font-semibold">15.0%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <p className="text-sm text-gray-500 font-medium mb-2">Pipeline Value</p>
            <p className="text-4xl font-bold text-yellow-700 mb-2">${(metrics.pipelineValue ?? 0).toFixed(1)}B</p>
            <div className="flex items-center text-sm text-yellow-600">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              <span className="font-semibold">23.7%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Gauges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CircularProgress value={metrics.responseRate} label="Response Rate" />
              <CircularProgress value={metrics.conversionRate} label="Conversion Rate" />
              <CircularProgress value={metrics.slaCompliance} label="SLA Compliance" />
              <CircularProgress value={metrics.investorSatisfaction} label="Satisfaction" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agency Scorecard</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-2 font-semibold text-gray-700">Agency</th>
                    <th className="pb-2 font-semibold text-gray-700 text-center">Score</th>
                    <th className="pb-2 font-semibold text-gray-700 text-center">Active</th>
                    <th className="pb-2 font-semibold text-gray-700 text-center">Today</th>
                    <th className="pb-2 font-semibold text-gray-700 text-right">Avg Response</th>
                    <th className="pb-2 font-semibold text-gray-700 text-right">SLA %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agencyScorecard.slice(0, 9).map((agency) => (
                    <tr key={agency.acronym} className="hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-900">{agency.acronym}</td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(agency.score)}`}>
                          {agency.score}
                        </span>
                      </td>
                      <td className="py-2 text-center text-gray-700">{agency.activeCases}</td>
                      <td className="py-2 text-center text-yellow-700 font-semibold">{agency.resolvedToday}</td>
                      <td className="py-2 text-right text-gray-700">{agency.avgResponseTime}</td>
                      <td className="py-2 text-right font-semibold text-gray-900">{agency.slaCompliance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BellAlertIcon className="w-6 h-6 text-red-600" />
                Alerts Feed
              </h2>
              <div className="flex gap-2">
                {(['all', 'critical', 'high', 'medium'] as AlertFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAlertFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      alertFilter === filter
                        ? 'bg-yellow-600 text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredAlerts.map((alert) => {
                const isAcknowledged = alert.acknowledged || acknowledgedAlerts.has(alert.id);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg ${getSeverityColor(alert.severity)} ${
                      isAcknowledged ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
                          <span className="text-xs text-gray-500">{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        {!isAcknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-xs font-semibold text-yellow-700 hover:text-neutral-800 flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
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

        <div className="bg-gradient-to-r from-neutral-800 to-yellow-600 rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-bold text-white mb-4">Executive Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => { setActionModal('flag'); setActionInput(''); }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <FlagIcon className="w-6 h-6" />
              <span className="font-semibold">Flag Priority Case</span>
            </button>
            <button
              onClick={() => { setActionModal('message'); setActionInput(''); }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span className="font-semibold">Send Team Message</span>
            </button>
            <button
              onClick={handleGenerateReport}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <DocumentTextIcon className="w-6 h-6" />
              <span className="font-semibold">Generate Report</span>
            </button>
            <button
              onClick={() => { setActionModal('review'); setActionInput(''); }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <CalendarIcon className="w-6 h-6" />
              <span className="font-semibold">Schedule Review</span>
            </button>
          </div>
        </div>

        {/* Action Modal */}
        {actionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {actionModal === 'flag'
                  ? 'Flag Priority Case'
                  : actionModal === 'message'
                    ? 'Send Team Message'
                    : 'Schedule Review'}
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
                  placeholder={
                    actionModal === 'message'
                      ? 'Type your message...'
                      : 'Review topic and notes...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setActionInput('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    actionModal === 'flag'
                      ? handleFlagCase
                      : actionModal === 'message'
                        ? handleSendMessage
                        : handleScheduleReview
                  }
                  disabled={!actionInput.trim() || actionLoading}
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {actionLoading
                    ? 'Processing...'
                    : actionModal === 'flag'
                      ? 'Flag Case'
                      : actionModal === 'message'
                        ? 'Send Message'
                        : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {actionSuccess && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
