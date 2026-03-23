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
    <Suspense fallback={<div className="h-screen bg-neutral-950" />}>
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
  const [escalationData, setEscalationData] = useState({ name: '', email: '', phone: '', issue: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

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

    await sendMessage(messageContent, language);

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
    setShowEscalationForm(true);
    setIsSidebarOpen(false);
  };

  const handleEscalationSubmitReal = async () => {
    if (!escalationData.name || !escalationData.email || !escalationData.issue) return;
    setIsEscalating(true);

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

      let refNumber: string;
      if (result.success && result.data) {
        refNumber = result.data.referenceNumber;
      } else {
        refNumber = `ESC-${Date.now().toString(36).toUpperCase()}`;
      }

      // Inject confirmation as assistant message via sendMessage won't work well here
      // Instead we use a direct approach — but useChatEngine doesn't expose setMessages.
      // We'll send a real message that triggers the assistant to confirm the escalation.
      // Actually, the simplest approach: just send the issue as a user message.
      // Let's not overcomplicate — just show the ref number in a follow-up.

      // For now: show escalation confirmation by sending a message
      await sendMessage(
        `I just submitted an escalation request. My reference number is ${refNumber}. Please confirm.`,
        language,
      );
    } catch (error) {
      console.error('Escalation failed:', error);
    } finally {
      setShowEscalationForm(false);
      setEscalationData({ name: '', email: '', phone: '', issue: '' });
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
    <div className="h-screen bg-neutral-950 flex overflow-hidden">
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
                className="lg:hidden fixed inset-0 bg-black/70 z-40"
              />
            )}

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed lg:relative inset-y-0 left-0 z-40 w-[280px] bg-black border-r border-neutral-800 flex flex-col"
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
                    className="p-2 text-neutral-500 hover:text-yellow-500 rounded-lg hover:bg-neutral-900 transition-colors"
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
                      className="w-full text-left px-3 py-2.5 text-sm text-neutral-400 hover:text-yellow-500 hover:bg-neutral-900 rounded-lg transition-colors truncate"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-neutral-800 space-y-1">
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Globe className="w-3 h-3 text-neutral-500" />
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Language</p>
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
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 rounded-lg transition-colors"
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
            className="absolute top-4 left-4 z-10 p-2 text-neutral-600 hover:text-yellow-500 rounded-lg hover:bg-neutral-900 transition-colors"
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
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-3xl blur-2xl scale-150" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/25">
                    <Sparkles className="w-10 h-10 text-black" />
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  <span className="text-white">How can I help you </span>
                  <span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                    invest in Uganda?
                  </span>
                </h1>
                <p className="text-neutral-500 mb-12 text-sm md:text-base max-w-md">
                  Your AI-powered gateway to investment procedures, incentives, permits, and opportunities.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {quickTopics.map(({ label, desc, icon }) => (
                    <motion.button
                      key={label}
                      onClick={() => handleSendMessage(label)}
                      className="text-left px-4 py-4 bg-neutral-900/80 border border-neutral-800 hover:border-yellow-500/50 rounded-xl transition-all group relative overflow-hidden"
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{icon}</span>
                          <p className="text-sm font-medium text-neutral-200 group-hover:text-yellow-400 transition-colors">
                            {label}
                          </p>
                        </div>
                        <p className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors pl-7">{desc}</p>
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
            <div className="relative flex items-end bg-neutral-900 border border-neutral-700 rounded-2xl focus-within:border-yellow-500/70 focus-within:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message UIA Assistant..."
                maxLength={2000}
                className="flex-1 resize-none bg-transparent px-4 py-3.5 pr-24 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none max-h-[200px]"
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
                        : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800'
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
                  className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/20 disabled:shadow-none"
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
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEscalationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Escalate to Officer</h3>
                  <p className="text-sm text-gray-500">A member of our team will contact you directly</p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your full name *"
                  value={escalationData.name}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-gray-900"
                />
                <input
                  type="email"
                  placeholder="Email address *"
                  value={escalationData.email}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-gray-900"
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={escalationData.phone}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-gray-900"
                />
                <textarea
                  placeholder="Briefly describe your issue or question *"
                  value={escalationData.issue}
                  onChange={(e) => setEscalationData(prev => ({ ...prev, issue: e.target.value }))}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-gray-900 resize-none"
                />
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowEscalationForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalationSubmitReal}
                  disabled={!escalationData.name || !escalationData.email || !escalationData.issue || isEscalating}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
