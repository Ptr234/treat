'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Plus,
  AlertCircle,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Globe,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ChatMessage from '@/components/chatbot/ChatMessage';
import LanguageSelector from '@/components/chatbot/LanguageSelector';
import type { ChatLanguage } from '@/types';
import { useChatEngine } from '@/hooks/useChatEngine';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { apiFetch } from '@/lib/api-client';

const quickTopics = [
  { label: 'Investment Procedures', desc: 'How to invest in Uganda', icon: '📋' },
  { label: 'Tax Incentives', desc: 'Discover tax benefits & exemptions', icon: '💰' },
  { label: 'Business Registration', desc: 'Register your company step by step', icon: '🏢' },
  { label: 'Work Permits', desc: 'Visa & permit requirements', icon: '📄' },
  { label: 'Industrial Parks', desc: 'Explore free zones & parks', icon: '🏭' },
  { label: 'Sector Opportunities', desc: 'Key investment sectors in Uganda', icon: '📈' },
];

export default function ChatbotPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white" />}>
      <ChatbotPageInner />
    </Suspense>
  );
}

function ChatbotPageInner() {
  const { messages, isTyping, sendMessage, clearMessages } = useChatEngine();
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationError, setEscalationError] = useState<string | null>(null);
  const [escalationData, setEscalationData] = useState({ name: '', email: '', phone: '', issue: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

  // Load user info from localStorage (set by ChatWidget pre-chat form or escalation form)
  const getUserInfo = useCallback(() => {
    try {
      const raw = localStorage.getItem('uia-chat-user-info');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
  }, []);

  const voice = useVoiceInput(language);

  // Auto-open escalation from ?escalate=true
  useEffect(() => {
    if (searchParams.get('escalate') === 'true') {
      setShowEscalationForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('chatLanguage') as ChatLanguage;
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatLanguage', language);
  }, [language]);

  const adjustTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  useEffect(() => {
    adjustTextarea();
  }, [inputValue, adjustTextarea]);

  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && isNearBottom()) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isNearBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent || isTyping) return;

    setInputValue('');
    setIsSidebarOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(messageContent, language, getUserInfo());

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setIsSidebarOpen(false);
    textareaRef.current?.focus();
  };

  const handleEscalate = () => {
    setEscalationError(null);
    setShowEscalationForm(true);
    setIsSidebarOpen(false);
  };

  const handleEscalationSubmitReal = async () => {
    if (!escalationData.name || !escalationData.email || !escalationData.issue) return;
    setIsEscalating(true);
    setEscalationError(null);

    try {
      const result = await apiFetch<{ referenceNumber: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: `Chat Escalation: ${escalationData.issue.slice(0, 80)}`,
          description: escalationData.issue,
          category: 'general_inquiry',
          contactEmail: escalationData.email,
          contactName: escalationData.name,
          contactPhone: escalationData.phone || '',
          priority: 'high',
          isEscalated: true,
        }),
      });

      // Never show a reference number that doesn't exist: if the ticket wasn't
      // created, keep the form open (with what they typed) and say so.
      if (!result.success || !result.data?.referenceNumber) {
        setEscalationError(
          `${result.error || 'We could not submit your request.'} Please try again, or call us on +256 414 301 000.`,
        );
        return;
      }
      const refNumber = result.data.referenceNumber;

      // Save escalation user info so future messages are logged with identity
      const escalationUserInfo = {
        name: escalationData.name,
        email: escalationData.email,
        phone: escalationData.phone,
      };
      try {
        localStorage.setItem('uia-chat-user-info', JSON.stringify(escalationUserInfo));
      } catch { /* ignore */ }

      // Log escalation with distinct tier so admin can filter in dashboard
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
      // ASP.NET's routes are versioned (/api/v1/...); the Next.js fallback this
      // mirrors (used when no backend URL is configured) is not.
      fetch(`${baseUrl}${baseUrl ? '/api/v1/chatbot/log' : '/api/chatbot/log'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `escalation-${Date.now().toString(36)}`,
          userName: escalationData.name,
          userEmail: escalationData.email,
          userPhone: escalationData.phone,
          userMessage: escalationData.issue,
          botResponse: `Escalation ticket created: ${refNumber}`,
          language,
          sentiment: 'negative',
          tier: 'escalation',
        }),
      }).catch(() => {});

      setShowEscalationForm(false);
      setEscalationData({ name: '', email: '', phone: '', issue: '' });

      await sendMessage(
        `I just submitted an escalation request. My reference number is ${refNumber}. Please confirm.`,
        language,
        escalationUserInfo,
      );
    } catch (error) {
      console.error('Escalation failed:', error);
      setEscalationError('Network error — your request was not submitted. Please check your connection and try again.');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleMicClick = () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening((transcript) => {
        setInputValue(prev => prev + transcript);
      });
    }
  };

  const showSidebar = isSidebarOpen || isLargeScreen;
  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-yellow-500 text-black p-2.5 rounded-lg shadow-lg hover:bg-yellow-400 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {isSidebarOpen && !isLargeScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-white z-40"
              />
            )}

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed lg:relative inset-y-0 left-0 z-40 w-[280px] bg-white border-r border-neutral-200 flex flex-col"
            >
              <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

              <div className="p-4 flex items-center justify-between">
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors text-sm font-semibold flex-1 mr-2"
                >
                  <Plus className="w-4 h-4" />
                  New chat
                </button>
                {isLargeScreen && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-neutral-600 hover:text-yellow-500 rounded-lg hover:bg-white transition-colors"
                    aria-label="Close sidebar"
                  >
                    <PanelLeftClose className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-3">
                <p className="text-[11px] font-semibold text-yellow-500/70 uppercase tracking-widest px-2 mb-2">
                  Quick Topics
                </p>
                <div className="space-y-0.5">
                  {quickTopics.map(({ label }) => (
                    <button
                      key={label}
                      onClick={() => handleSendMessage(label)}
                      className="w-full text-left px-3 py-2.5 text-sm text-neutral-700 hover:text-yellow-500 hover:bg-white rounded-lg transition-colors truncate"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-neutral-200 space-y-1">
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Globe className="w-3 h-3 text-neutral-600" />
                    <p className="text-[11px] font-semibold text-neutral-600 uppercase tracking-widest">Language</p>
                  </div>
                  <LanguageSelector
                    currentLanguage={language}
                    onLanguageChange={setLanguage}
                  />
                </div>
                <button
                  onClick={handleEscalate}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  Escalate to Officer
                </button>
                <Link
                  href="/"
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-700 hover:bg-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>

              <div className="h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {!showSidebar && isLargeScreen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 text-neutral-600 hover:text-yellow-500 rounded-lg hover:bg-white transition-colors"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto min-h-0"
        >
          {!hasMessages ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center max-w-2xl w-full"
              >
                <div className="relative mb-8">
                                    <div className="relative w-20 h-20 bg-yellow-400 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-black" />
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  <span className="text-black">How can I help you </span>
                  <span className="text-red-600">
                    invest in Uganda?
                  </span>
                </h1>
                <p className="text-neutral-600 mb-12 text-sm md:text-base max-w-md">
                  Your AI-powered gateway to investment procedures, incentives, permits, and opportunities.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {quickTopics.map(({ label, desc, icon }) => (
                    <motion.button
                      key={label}
                      onClick={() => handleSendMessage(label)}
                      className="text-left border-t-2 border-neutral-200 py-4 pr-4 transition-colors hover:border-black group relative"
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                                            <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{icon}</span>
                          <p className="text-sm font-medium text-neutral-700 group-hover:text-yellow-400 transition-colors">
                            {label}
                          </p>
                        </div>
                        <p className="text-xs text-neutral-600 group-hover:text-neutral-700 transition-colors pl-7">{desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 pb-4 pt-2 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end border-b border-neutral-200 focus-within:border-red-600 transition-colors">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message UIA Assistant..."
                maxLength={2000}
                className="flex-1 resize-none bg-transparent px-1 py-3.5 pr-24 text-sm text-black placeholder:text-neutral-500 focus:outline-none max-h-[200px]"
                rows={1}
                disabled={isTyping}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                {voice.isSupported && (
                  <button
                    onClick={handleMicClick}
                    className={`p-2 rounded-lg transition-colors ${
                      voice.isListening
                        ? 'text-red-400 bg-red-500/20 animate-pulse'
                        : 'text-neutral-600 hover:text-neutral-700 hover:bg-white'
                    }`}
                    aria-label={voice.isListening ? 'Stop listening' : 'Voice input'}
                    title={voice.isListening ? 'Stop listening' : 'Voice input'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-black text-yellow-400 hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-700 text-center mt-2">
              AI Assistant may produce inaccurate information. Verify critical details with UIA directly.
            </p>
          </div>
        </div>
      </div>

      {/* Escalation Form Modal */}
      <AnimatePresence>
        {showEscalationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4"
            onClick={() => setShowEscalationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-black">Escalate to officer</h3>
                  <p className="text-sm text-neutral-600">A member of our team will contact you directly</p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your full name *"
                  value={escalationData.name}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-neutral-400 bg-white text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                />
                <input
                  type="email"
                  placeholder="Email address *"
                  value={escalationData.email}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-neutral-400 bg-white text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={escalationData.phone}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-neutral-400 bg-white text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                />
                <textarea
                  placeholder="Briefly describe your issue or question *"
                  value={escalationData.issue}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, issue: e.target.value }))}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2.5 border border-neutral-400 bg-white text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 resize-none"
                />
              </div>
              {escalationError && (
                <p role="alert" className="mt-3 border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {escalationError}
                </p>
              )}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowEscalationForm(false)}
                  className="flex-1 border-2 border-black px-4 py-2.5 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalationSubmitReal}
                  disabled={!escalationData.name || !escalationData.email || !escalationData.issue || isEscalating}
                  className="flex-1 bg-black px-4 py-2.5 text-sm font-bold text-yellow-400 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isEscalating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Escalation'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
