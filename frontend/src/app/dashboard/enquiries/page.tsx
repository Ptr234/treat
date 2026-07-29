'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import {
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
  LockClosedIcon,
  GlobeAltIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  MinusCircleIcon,
  CpuChipIcon,
  BookOpenIcon,
  LightBulbIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface EnquiryStats {
  total: number;
  today: number;
  thisWeek: number;
  byLanguage: Record<string, number>;
  bySentiment: Record<string, number>;
  byTier: Record<string, number>;
  uniqueSessions: number;
}

interface Enquiry {
  _id: string;
  sessionId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userLocation?: string;
  userMessage: string;
  botResponse: string;
  language: string;
  sentiment?: string;
  tier: string;
  createdAt: string;
}

const LANG_LABELS: Record<string, string> = {
  en: 'English', fr: 'French', ar: 'Arabic', zh: 'Chinese', sw: 'Swahili',
};

const LANG_FLAGS: Record<string, string> = {
  en: 'EN', fr: 'FR', ar: 'AR', zh: 'ZH', sw: 'SW',
};

const TIER_LABELS: Record<string, string> = {
  ai: 'AI (Groq)', kb: 'Knowledge Base', suggestions: 'Topic Suggestions',
  escalation: 'Escalated',
};

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; icon: typeof FaceSmileIcon }> = {
  positive: { label: 'Positive', color: 'text-green-600 bg-green-100', icon: FaceSmileIcon },
  neutral: { label: 'Neutral', color: 'text-gray-600 bg-gray-100', icon: MinusCircleIcon },
  negative: { label: 'Negative', color: 'text-red-600 bg-red-100', icon: FaceFrownIcon },
};

const TIER_CONFIG: Record<string, { icon: typeof CpuChipIcon; color: string }> = {
  ai: { icon: CpuChipIcon, color: 'text-purple-600 bg-purple-100' },
  kb: { icon: BookOpenIcon, color: 'text-blue-600 bg-blue-100' },
  suggestions: { icon: LightBulbIcon, color: 'text-yellow-600 bg-yellow-100' },
  escalation: { icon: FaceFrownIcon, color: 'text-red-600 bg-red-100' },
};

/**
 * Look-ups above are keyed lower-case, but the API serialises the .NET enums in
 * PascalCase ("Neutral", "Kb", "Escalation"). Without normalising, every row
 * rendered an unstyled fallback — sentiment showed "-" and every tier showed
 * "Tips" regardless of the actual value.
 */
const key = (v: string | null | undefined): string => (v ?? '').toLowerCase();

/** Short tier badge text used in the table. */
const tierShort = (tier: string): string => {
  const k = key(tier);
  if (k === 'ai') return 'AI';
  if (k === 'kb') return 'KB';
  if (k === 'escalation') return 'ESC';
  return 'Tips';
};

const PAGE_SIZE = 20;

export default function EnquiriesPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && isAdminLevel(user?.role);

  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Enquiry[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const json = await apiFetch<EnquiryStats>('/api/dashboard/enquiries?action=stats');
      // Normalise before it reaches the render tree: a missing breakdown must
      // show as "no data", never crash the whole dashboard page.
      if (json.success && json.data) {
        const d = json.data as Partial<EnquiryStats>;
        setStats({
          total: d.total ?? 0,
          today: d.today ?? 0,
          thisWeek: d.thisWeek ?? 0,
          uniqueSessions: d.uniqueSessions ?? 0,
          byLanguage: d.byLanguage ?? {},
          bySentiment: d.bySentiment ?? {},
          byTier: d.byTier ?? {},
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchEnquiries = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const json = await apiFetch<{ enquiries: Enquiry[]; total: number } | Enquiry[]>(
        `/api/dashboard/enquiries?from=${from}&to=${to}`
      );
      if (json.success) {
        // ASP.NET returns { enquiries, total }; the legacy Next route returned
        // a bare array. Accept both so the table never receives a non-array.
        const raw = json.data;
        const rows = Array.isArray(raw) ? raw : (raw?.enquiries ?? []);
        setEnquiries(rows);
        setTotal(Array.isArray(raw) ? rows.length : (raw?.total ?? 0));
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSession = async (sessionId: string) => {
    setSessionLoading(true);
    setSelectedSession(sessionId);
    try {
      const json = await apiFetch<Enquiry[]>(`/api/dashboard/enquiries?action=session&sessionId=${encodeURIComponent(sessionId)}`);
      if (json.success) setSessionMessages(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchEnquiries(0);
    }
  }, [isAdmin, fetchStats, fetchEnquiries]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchEnquiries(newPage);
  };

  const refresh = () => {
    fetchStats();
    fetchEnquiries(page);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-strong p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Chat Enquiries</h1>
          <p className="text-gray-600 mb-6">Admin authorization required to view chat enquiry data.</p>
          <Link href="/" className="inline-block w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-yellow-600" />
                Chat Enquiries
              </h1>
            </div>
            <p className="text-gray-600 ml-8">AI chatbot conversations and enquiry analytics</p>
          </div>
          <button
            onClick={refresh}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.uniqueSessions} conversations</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Today</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.today}</p>
              <p className="text-xs text-gray-400 mt-1">messages today</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">This Week</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.thisWeek}</p>
              <p className="text-xs text-gray-400 mt-1">last 7 days</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">AI Success Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.total > 0 ? Math.round(((stats.byTier.ai ?? 0) / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">handled by Groq AI</p>
            </div>
          </div>
        )}

        {/* Breakdown Chips */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Language breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4" /> By Language
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byLanguage).filter(([,v]) => v > 0).map(([lang, count]) => (
                  <span key={lang} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                    {LANG_FLAGS[key(lang)] || lang} {count}
                  </span>
                ))}
                {Object.values(stats.byLanguage).every(v => v === 0) && (
                  <span className="text-xs text-gray-400">No data yet</span>
                )}
              </div>
            </div>

            {/* Sentiment breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaceSmileIcon className="w-4 h-4" /> By Sentiment
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.bySentiment).filter(([,v]) => v > 0).map(([sent, count]) => {
                  const cfg = SENTIMENT_CONFIG[key(sent)];
                  return (
                    <span key={sent} className={`px-3 py-1 rounded-full text-xs font-medium ${cfg?.color || 'bg-gray-100 text-gray-700'}`}>
                      {cfg?.label || sent} {count}
                    </span>
                  );
                })}
                {Object.values(stats.bySentiment).every(v => v === 0) && (
                  <span className="text-xs text-gray-400">No data yet</span>
                )}
              </div>
            </div>

            {/* Tier breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CpuChipIcon className="w-4 h-4" /> By Response Tier
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byTier).filter(([,v]) => v > 0).map(([tier, count]) => {
                  const cfg = TIER_CONFIG[key(tier)];
                  return (
                    <span key={tier} className={`px-3 py-1 rounded-full text-xs font-medium ${cfg?.color || 'bg-gray-100 text-gray-700'}`}>
                      {TIER_LABELS[key(tier)] || tier} {count}
                    </span>
                  );
                })}
                {Object.values(stats.byTier).every(v => v === 0) && (
                  <span className="text-xs text-gray-400">No data yet</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enquiries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Enquiries</h2>
            <span className="text-sm text-gray-500">{total} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="text-center py-16">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No chat enquiries yet</p>
              <p className="text-sm text-gray-400 mt-1">Enquiries will appear here once users start chatting</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600">User</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Message</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-center">Lang</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-center">Sentiment</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-center">Tier</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-right">Time</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-center">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enquiries.map((enq) => {
                      const sentCfg = enq.sentiment ? SENTIMENT_CONFIG[key(enq.sentiment)] : null;
                      const tierCfg = TIER_CONFIG[key(enq.tier)];
                      const TierIcon = tierCfg?.icon || CpuChipIcon;
                      return (
                        <tr key={enq._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="max-w-[140px]">
                              <p className="font-medium text-gray-900 truncate">{enq.userName || 'Anonymous'}</p>
                              {enq.userEmail && (
                                <p className="text-xs text-gray-400 truncate">{enq.userEmail}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="text-gray-700 truncate max-w-[280px]">{enq.userMessage}</p>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                              {LANG_FLAGS[key(enq.language)] || enq.language}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {sentCfg ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sentCfg.color}`}>
                                <sentCfg.icon className="w-3 h-3" />
                                {sentCfg.label}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierCfg?.color || 'bg-gray-100 text-gray-600'}`}>
                              <TierIcon className="w-3 h-3" />
                              {tierShort(enq.tier)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                            {new Date(enq.createdAt).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => fetchSession(enq.sessionId)}
                              className="p-1.5 rounded-lg hover:bg-yellow-100 text-gray-500 hover:text-yellow-700 transition-colors"
                              title="View conversation"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conversation Viewer Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Conversation</h3>
                <p className="text-xs text-gray-500 mt-0.5">Session: {selectedSession}</p>
              </div>
              <button
                onClick={() => { setSelectedSession(null); setSessionMessages([]); }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User info card (from first message) */}
            {(() => {
              const first = sessionMessages[0];
              if (!first?.userName) return null;
              return (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm">
                  {first.userName && (
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      {first.userName}
                    </span>
                  )}
                  {first.userEmail && (
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      {first.userEmail}
                    </span>
                  )}
                  {first.userPhone && (
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      {first.userPhone}
                    </span>
                  )}
                  {first.userLocation && (
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      {first.userLocation}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                    {LANG_LABELS[key(first.language)] || first.language}
                  </span>
                </div>
              </div>
              );
            })()}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {sessionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sessionMessages.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No messages found</p>
              ) : (
                sessionMessages.map((msg) => (
                  <div key={msg._id} className="space-y-2">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 max-w-[85%]">
                        <p className="text-sm text-gray-800">{msg.userMessage}</p>
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {/* Bot response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl px-4 py-2.5 max-w-[85%]">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.botResponse}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {msg.sentiment && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${SENTIMENT_CONFIG[key(msg.sentiment)]?.color || ''}`}>
                              {SENTIMENT_CONFIG[key(msg.sentiment)]?.label || msg.sentiment}
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${TIER_CONFIG[key(msg.tier)]?.color || 'bg-gray-200'}`}>
                            {TIER_LABELS[key(msg.tier)] || msg.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
