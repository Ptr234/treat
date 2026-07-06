'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  HashtagIcon,
  LockClosedIcon,
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────────────────

interface MessageAttachment {
  url: string;
  originalFilename: string;
}

interface PendingAttachment {
  name: string;
  size: number;
  url: string;
  assetId: string;
  fileRef: { _type: 'file'; asset: { _type: 'reference'; _ref: string } };
}

interface Message {
  _id: string;
  channel: string;
  content: string;
  senderName: string;
  senderAgencyCode: string;
  senderEmail?: string;
  isInternal: boolean;
  sentAt: string;
  attachments?: MessageAttachment[];
  _optimistic?: boolean;
}

interface Ticket {
  referenceNumber: string;
  title: string;
  status: string;
  agencyCode?: string;
}

interface ReplyTarget {
  _id: string;
  senderName: string;
  senderAgencyCode: string;
  content: string;
}

// ── Agency colour map ────────────────────────────────────────────────

const AGENCY_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  UIA:   { bg: 'bg-yellow-500/20', text: 'text-yellow-400', ring: 'ring-yellow-500/40' },
  URSB:  { bg: 'bg-blue-500/20',   text: 'text-blue-400',   ring: 'ring-blue-500/40' },
  URA:   { bg: 'bg-green-500/20',  text: 'text-green-400',  ring: 'ring-green-500/40' },
  DCIC:  { bg: 'bg-purple-500/20', text: 'text-purple-400', ring: 'ring-purple-500/40' },
  NEMA:  { bg: 'bg-emerald-500/20',text: 'text-emerald-400',ring: 'ring-emerald-500/40' },
  KCCA:  { bg: 'bg-orange-500/20', text: 'text-orange-400', ring: 'ring-orange-500/40' },
  LANDS: { bg: 'bg-amber-500/20',  text: 'text-amber-400',  ring: 'ring-amber-500/40' },
  UNBS:  { bg: 'bg-cyan-500/20',   text: 'text-cyan-400',   ring: 'ring-cyan-500/40' },
  ERA:   { bg: 'bg-rose-500/20',   text: 'text-rose-400',   ring: 'ring-rose-500/40' },
};

const DEFAULT_COLOR = { bg: 'bg-neutral-700/40', text: 'text-neutral-300', ring: 'ring-neutral-600/40' };

const AGENCY_CODES = ['UIA', 'URSB', 'URA', 'DCIC', 'NEMA', 'KCCA', 'LANDS', 'UNBS', 'ERA'] as const;

function getAgencyColor(code: string) {
  return AGENCY_COLORS[code] ?? DEFAULT_COLOR;
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const date = formatDate(msg.sentAt);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1]?.messages.push(msg);
    }
  }
  return groups;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

// ── Read-state persistence ──────────────────────────────────────────

const READ_STATE_KEY = 'osc-chat-read-state';

function getReadState(): Record<string, number> {
  try {
    const raw = localStorage.getItem(READ_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setReadState(channel: string, count: number) {
  try {
    const state = getReadState();
    state[channel] = count;
    localStorage.setItem(READ_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// ── Component ────────────────────────────────────────────────────────

export default function AgencyChatPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // State
  const [channels, setChannels] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderAgencyCode, setSenderAgencyCode] = useState<string>('UIA');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  // New state for improvements
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [channelMsgCounts, setChannelMsgCounts] = useState<Record<string, number>>({});
  const [readState, setReadStateLocal] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // Load read state on mount
  useEffect(() => {
    setReadStateLocal(getReadState());
  }, []);

  // ── Scroll tracking ──────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMsgCount(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMsgCount(0);
  }, []);

  // ── Fetch channel list ──────────────────────────────────────────────

  const fetchChannels = useCallback(async () => {
    try {
      const json = await apiFetch<{ channels: string[]; tickets: Ticket[] }>('/api/messages/');
      if (json.success && json.data) {
        setChannels(json.data.channels ?? []);
        setTickets(json.data.tickets ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch channels', err);
    }
  }, []);

  useEffect(() => {
    void fetchChannels();
  }, [fetchChannels]);

  // ── Fetch messages for active channel ───────────────────────────────

  const fetchMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const json = await apiFetch<Message[]>(`/api/messages/?channel=${encodeURIComponent(activeChannel)}`);
      if (json.success) {
        const fetched: Message[] = (json.data as Message[]) ?? [];
        setMessages(fetched);

        // Track channel message counts for unread
        setChannelMsgCounts((prev) => ({ ...prev, [activeChannel]: fetched.length }));
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // ── Poll every 10 seconds ──────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchMessages();
    }, 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // ── Track new messages for unread badge ─────────────────────────────

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && !isAtBottom && prevMessageCountRef.current > 0) {
      setNewMsgCount((c) => c + (messages.length - prevMessageCountRef.current));
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  // ── Auto-scroll only when at bottom ─────────────────────────────────

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // ── Mark channel as read when switching ─────────────────────────────

  useEffect(() => {
    setReadState(activeChannel, messages.length);
    setReadStateLocal((prev) => ({ ...prev, [activeChannel]: messages.length }));
  }, [activeChannel, messages.length]);

  // ── Auto-resize textarea ────────────────────────────────────────────

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  // ── Send a message ─────────────────────────────────────────────────

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = replyTarget
      ? `> **${replyTarget.senderName}** (${replyTarget.senderAgencyCode}): ${truncate(replyTarget.content, 100)}\n\n${newMessage.trim()}`
      : newMessage.trim();

    // Optimistic insert
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: optimisticId,
      channel: activeChannel,
      content: messageContent,
      senderName: user?.name || 'Admin',
      senderAgencyCode,
      senderEmail: user?.email,
      isInternal: false,
      sentAt: new Date().toISOString(),
      attachments: pendingAttachments.map((a) => ({ url: a.url, originalFilename: a.name })),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setIsAtBottom(true);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const savedMessage = newMessage;
    const savedAttachments = [...pendingAttachments];
    const savedReply = replyTarget;
    setNewMessage('');
    setPendingAttachments([]);
    setReplyTarget(null);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setSending(true);
    setSendError(null);
    try {
      const json = await apiFetch('/api/messages/', {
        method: 'POST',
        body: JSON.stringify({
          channel: activeChannel,
          content: messageContent,
          senderAgencyCode,
          ...(savedAttachments.length > 0
            ? { attachments: savedAttachments.map((a) => a.fileRef) }
            : {}),
        }),
      });
      if (!json.success) {
        // Rollback optimistic
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
        setNewMessage(savedMessage);
        setPendingAttachments(savedAttachments);
        setReplyTarget(savedReply);
        setSendError(json.error || 'Failed to send message');
        return;
      }
      // Replace optimistic with real message on next poll
      void fetchMessages();
      void fetchChannels();
    } catch (err) {
      // Rollback
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setNewMessage(savedMessage);
      setPendingAttachments(savedAttachments);
      setReplyTarget(savedReply);
      setSendError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ── File attachment handling ────────────────────────────────────────

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - pendingAttachments.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const uploaded: PendingAttachment[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append('file', file);
        // Agency chat attachments are Sanity message assets, not ticket documents.
        // Keep this on the Next.js upload route; the ASP.NET upload endpoint
        // expects ticketRefNumber + files[] and would reject this payload.
        const res = await fetch('/api/upload/', { method: 'POST', body: formData, credentials: 'include' });
        if (!res.ok) continue;
        const json = await res.json();
        if (json.success) {
          uploaded.push({
            name: json.data.originalFilename,
            size: json.data.size,
            url: json.data.url,
            assetId: json.data.assetId,
            fileRef: json.data.fileRef,
          });
        }
      }
      setPendingAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Failed to upload file', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (assetId: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.assetId !== assetId));
  };

  // ── Build channel list (General + ticket-based) ────────────────────

  const ticketChannels = tickets.map((t) => t.referenceNumber);
  const allChannels = ['general', ...ticketChannels.filter(Boolean)];
  const extraChannels = channels.filter(
    (ch) => ch !== 'general' && !ticketChannels.includes(ch),
  );
  const fullChannelList = [...allChannels, ...extraChannels];
  const uniqueChannelList = [...new Set(fullChannelList)];

  const getTicketInfo = (channel: string): Ticket | undefined =>
    tickets.find((t) => t.referenceNumber === channel);

  // ── Filtered messages (search) ──────────────────────────────────────

  const displayMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.senderAgencyCode.toLowerCase().includes(q),
    );
  }, [messages, searchQuery]);

  const dateGroups = groupMessagesByDate(displayMessages);

  // ── Unread count helper ──────────────────────────────────────────────

  const getUnreadCount = (channel: string): number => {
    const total = channelMsgCounts[channel] ?? 0;
    const read = readState[channel] ?? 0;
    return Math.max(0, total - read);
  };

  // ── Render ─────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Agency Chat</h1>
          <p className="text-gray-600 mb-6">
            Inter-agency messaging requires admin authorization.
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

  return (
    <div className="min-h-screen bg-black">
      {/* Page header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Inter-Agency Chat</h1>
              <p className="text-sm text-neutral-400">
                Collaborate across agencies on investor cases
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* ── Mobile sidebar toggle ─────────────────────────────── */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-500 transition-colors"
            aria-label="Toggle channels"
          >
            <UserGroupIcon className="w-5 h-5" />
          </button>

          {/* ── Left sidebar: channels ────────────────────────────── */}
          <aside
            className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0 lg:relative
              fixed inset-y-0 left-0 z-40 w-72 lg:w-72 flex-shrink-0
              bg-neutral-900 border border-neutral-800 rounded-none lg:rounded-2xl
              transition-transform duration-200 ease-out
              flex flex-col overflow-hidden
            `}
          >
            {/* Sidebar header */}
            <div className="px-4 py-4 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-sm font-semibold text-white">Channels</h2>
                </div>
                <span className="text-xs text-neutral-500">
                  {uniqueChannelList.length}
                </span>
              </div>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {uniqueChannelList.map((ch) => {
                const isActive = ch === activeChannel;
                const ticketInfo = getTicketInfo(ch);
                const isGeneral = ch === 'general';
                const unread = getUnreadCount(ch);

                return (
                  <button
                    key={ch}
                    onClick={() => {
                      setActiveChannel(ch);
                      setSidebarOpen(false);
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150
                      ${isActive
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isGeneral ? (
                        <ChatBubbleLeftRightIcon className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <HashtagIcon className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium truncate flex-1 ${unread > 0 && !isActive ? 'text-white font-bold' : ''}`}>
                        {isGeneral ? 'General' : ch}
                      </span>
                      {unread > 0 && !isActive && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                    {ticketInfo && (
                      <p className="mt-0.5 ml-6 text-xs text-neutral-500 truncate">
                        {ticketInfo.title}
                      </p>
                    )}
                    {ticketInfo && (
                      <div className="mt-1 ml-6 flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {ticketInfo.status}
                        </span>
                        {ticketInfo.agencyCode && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ring-1 ${getAgencyColor(ticketInfo.agencyCode).bg} ${getAgencyColor(ticketInfo.agencyCode).text} ${getAgencyColor(ticketInfo.agencyCode).ring}`}
                          >
                            {ticketInfo.agencyCode}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}

              {uniqueChannelList.length === 0 && (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No channels yet
                </div>
              )}
            </div>
          </aside>

          {/* ── Sidebar backdrop (mobile) ─────────────────────────── */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Main chat area ────────────────────────────────────── */}
          <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden min-w-0">
            {/* Channel header */}
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-800 flex items-center gap-3">
              {activeChannel === 'general' ? (
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              ) : (
                <HashtagIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-white truncate">
                  {activeChannel === 'general' ? 'General' : activeChannel}
                </h3>
                {activeChannel === 'general' ? (
                  <p className="text-xs text-neutral-400">
                    Cross-agency coordination &amp; announcements
                  </p>
                ) : (
                  (() => {
                    const ti = getTicketInfo(activeChannel);
                    return ti ? (
                      <p className="text-xs text-neutral-400 truncate">
                        {ti.title}
                      </p>
                    ) : null;
                  })()
                )}
              </div>

              {/* Message search toggle + count */}
              <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (searchOpen) setSearchQuery('');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    searchOpen
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                  }`}
                  aria-label="Search messages"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
                <span className="text-xs text-neutral-500">{messages.length} msgs</span>
              </div>
            </div>

            {/* Search bar (collapsible) */}
            {searchOpen && (
              <div className="px-4 sm:px-6 py-2 border-b border-neutral-800 bg-neutral-900/80">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages, names, or agencies..."
                    autoFocus
                    className="w-full pl-9 pr-8 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-[11px] text-neutral-500 mt-1.5">
                    {displayMessages.length} result{displayMessages.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
            )}

            {/* Messages area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 relative"
            >
              {loadingMessages && messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-neutral-500 text-sm animate-pulse">
                    Loading messages...
                  </div>
                </div>
              )}

              {!loadingMessages && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500">
                  <ChatBubbleLeftRightIcon className="w-12 h-12" />
                  <p className="text-sm">No messages yet in this channel</p>
                  <p className="text-xs">Be the first to send a message</p>
                </div>
              )}

              {searchQuery && displayMessages.length === 0 && messages.length > 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500">
                  <MagnifyingGlassIcon className="w-10 h-10" />
                  <p className="text-sm">No messages match &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}

              {dateGroups.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-neutral-800" />
                    <span className="text-xs text-neutral-500 font-medium px-2">
                      {group.date}
                    </span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>

                  {/* Messages in this group */}
                  {group.messages.map((msg) => {
                    const color = getAgencyColor(msg.senderAgencyCode);
                    const isOptimistic = msg._optimistic;
                    return (
                      <div
                        key={msg._id}
                        className={`group flex gap-3 py-2 hover:bg-neutral-800/30 rounded-xl px-2 -mx-2 transition-colors ${
                          isOptimistic ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${color.bg} ${color.text}`}
                        >
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">
                              {msg.senderName}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ring-1 font-medium ${color.bg} ${color.text} ${color.ring}`}
                            >
                              {msg.senderAgencyCode}
                            </span>
                            <span className="text-[11px] text-neutral-600 group-hover:text-neutral-500 transition-colors">
                              {formatTime(msg.sentAt)}
                            </span>
                            {isOptimistic && (
                              <span className="text-[10px] text-neutral-600 italic">Sending...</span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-300 mt-0.5 whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {msg.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-yellow-500/40 hover:bg-neutral-700 transition-colors text-xs text-neutral-300 hover:text-yellow-400"
                                >
                                  <DocumentIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate max-w-[160px]">
                                    {att.originalFilename || 'Attachment'}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reply button (visible on hover) */}
                        {!isOptimistic && (
                          <button
                            onClick={() => {
                              setReplyTarget({
                                _id: msg._id,
                                senderName: msg.senderName,
                                senderAgencyCode: msg.senderAgencyCode,
                                content: msg.content,
                              });
                              inputRef.current?.focus();
                            }}
                            className="self-start mt-1 p-1.5 rounded-lg text-neutral-600 opacity-0 group-hover:opacity-100 hover:bg-neutral-800 hover:text-yellow-400 transition-all flex-shrink-0"
                            title="Reply to this message"
                          >
                            <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Scroll-to-bottom button ────────────────────────── */}
            {!isAtBottom && (
              <div className="absolute bottom-[200px] right-8 z-10">
                <button
                  onClick={scrollToBottom}
                  className="relative w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:border-yellow-500/40 text-neutral-400 hover:text-yellow-400 shadow-lg transition-all flex items-center justify-center"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDownIcon className="w-5 h-5" />
                  {newMsgCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {newMsgCount > 99 ? '99+' : newMsgCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* ── Sender info bar ─────────────────────────────────── */}
            <div className="px-4 sm:px-6 py-3 border-t border-neutral-800 bg-neutral-900/80">
              {/* Reply preview */}
              {replyTarget && (
                <div className="mb-2 flex items-start gap-2 px-3 py-2 bg-neutral-800/60 border-l-2 border-yellow-500 rounded-r-lg">
                  <ArrowUturnLeftIcon className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-yellow-400">
                      {replyTarget.senderName}
                    </span>
                    <span className="text-[10px] text-neutral-500 ml-1.5">
                      {replyTarget.senderAgencyCode}
                    </span>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {truncate(replyTarget.content, 120)}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTarget(null)}
                    className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-white transition-colors flex-shrink-0"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Logged-in user identity */}
                <span className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300">
                  {user?.name || 'Admin'}
                </span>

                {/* Agency selector */}
                <select
                  value={senderAgencyCode}
                  onChange={(e) => setSenderAgencyCode(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 appearance-none cursor-pointer"
                >
                  {AGENCY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>

                {/* Keyboard hint */}
                <span className="hidden sm:inline text-[10px] text-neutral-600 ml-auto">
                  Enter to send &middot; Shift+Enter for new line
                </span>
              </div>

              {/* Send error display */}
              {sendError && (
                <div className="mb-2 px-3 py-1.5 text-xs text-red-400 bg-red-900/30 border border-red-800/50 rounded-lg flex items-center justify-between">
                  <span>{sendError}</span>
                  <button
                    onClick={() => setSendError(null)}
                    className="ml-2 p-0.5 rounded hover:bg-red-800/50 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pending attachments pills */}
              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {pendingAttachments.map((att) => (
                    <span
                      key={att.assetId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300"
                    >
                      <DocumentIcon className="w-3.5 h-3.5 flex-shrink-0 text-yellow-500" />
                      <span className="truncate max-w-[140px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.assetId)}
                        className="ml-0.5 p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Uploading indicator */}
              {uploading && (
                <div className="flex items-center gap-2 mb-2 text-xs text-yellow-500 animate-pulse">
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading file...
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Message input */}
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend(e);
                    }
                  }}
                  placeholder={`Message #${activeChannel === 'general' ? 'general' : activeChannel}...`}
                  rows={1}
                  className="flex-1 px-4 py-2.5 text-sm bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 resize-none overflow-hidden"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || pendingAttachments.length >= 3}
                  className="px-3 py-2.5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:border-yellow-500/40 disabled:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-400 hover:text-yellow-400 rounded-xl transition-colors flex items-center flex-shrink-0"
                  title="Attach files (max 3)"
                >
                  <PaperClipIcon className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 font-medium text-sm"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {sending ? 'Sending...' : 'Send'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
