'use client';

import { useState } from 'react';
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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

type AlertFilter = 'all' | 'critical' | 'high' | 'medium';

export default function DashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const { metrics, loading, error, isLive, refresh } = useDashboard();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-strong p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FlagIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Director General Dashboard</h1>
          <p className="text-gray-600 mb-6">
            This dashboard requires Director General authorization to access live operational data and executive controls.
          </p>
          <button
            onClick={() => setIsAuthorized(true)}
            className="w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors shadow-md hover:shadow-lg"
          >
            Enter Dashboard
          </button>
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

  const filteredAlerts = metrics.alerts.filter((alert) => {
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
            <p className="text-4xl font-bold text-yellow-700 mb-2">${metrics.pipelineValue.toFixed(1)}B</p>
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
                  {metrics.agencyScorecard.slice(0, 9).map((agency) => (
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
              {metrics.recentActivity.map((activity) => (
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
              onClick={() => alert('Flag Priority Case - This would open a modal to flag a case for immediate attention')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <FlagIcon className="w-6 h-6" />
              <span className="font-semibold">Flag Priority Case</span>
            </button>
            <button
              onClick={() => alert('Send Team Message - This would open a messaging interface to broadcast to the team')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span className="font-semibold">Send Team Message</span>
            </button>
            <button
              onClick={() => alert('Generate Report - This would open a report generation wizard')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <DocumentTextIcon className="w-6 h-6" />
              <span className="font-semibold">Generate Report</span>
            </button>
            <button
              onClick={() => alert('Schedule Review - This would open a calendar to schedule a team review meeting')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg transition-all hover:shadow-lg flex items-center gap-3"
            >
              <CalendarIcon className="w-6 h-6" />
              <span className="font-semibold">Schedule Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
