'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import LanguageSelector from './LanguageSelector';
import AssistantSignInGate from './AssistantSignInGate';
import type { ChatLanguage } from '@/types';
import type { ChatUserInfo } from '@/lib/chatbot-service';
import { useAuth } from '@/contexts/AuthContext';
import { useChatEngine } from '@/hooks/useChatEngine';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, sendMessage } = useChatEngine();
  const { user, isAuthenticated } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  /** True while the site footer is scrolled into view — the launcher hides then. */
  const [footerVisible, setFooterVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(false);

  // The assistant is for signed-in users only: identity always comes from the
  // live session, never from details saved in the browser.
  const userInfo = useMemo<ChatUserInfo | null>(
    () => (isAuthenticated && user ? { name: user.name, email: user.email } : null),
    [isAuthenticated, user]
  );

  const voice = useVoiceInput(language);

  // Hide the launcher once the footer is reached — but never while a
  // conversation is open, or the user would lose the close button.
  const hideLauncher = footerVisible && !isOpen;

  // Load the saved language on mount. (Guest contact details from older
  // versions of the widget are discarded.)
  useEffect(() => {
    const savedLanguage = localStorage.getItem('chatLanguage') as ChatLanguage;
    if (savedLanguage) setLanguage(savedLanguage);
    try {
      localStorage.removeItem('uia-chat-user-info');
    } catch {
      // storage unavailable — nothing to clear
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatLanguage', language);
  }, [language]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
      setShowTooltip(false);
      if (userInfo) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, userInfo]);

  // Tooltip auto-show after 3s, auto-dismiss after 8s — only if never opened
  useEffect(() => {
    if (isOpenRef.current || isOpen || messages.length > 0) return;

    const showTimer = setTimeout(() => {
      if (!isOpenRef.current) setShowTooltip(true);
    }, 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 11000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen, messages.length]);

  // Keep the floating button clear of the footer. It is position:fixed, so it
  // would otherwise sit on top of the footer's links and contact details once
  // the reader scrolls to the bottom. Hide it while the footer is on screen
  // (an open conversation stays open — only the launcher is hidden).
  useEffect(() => {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => setFooterVisible(entries.some((e) => e.isIntersecting)),
      // A small negative margin means it hides just as the footer reaches the
      // button rather than the instant its first pixel appears.
      { rootMargin: '0px 0px -64px 0px' }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Listen for custom event to open chat from other components
  const handleOpenChat = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<{ message?: string }>;
    setIsOpen(true);
    setShowTooltip(false);

    if (customEvent.detail?.message && userInfo) {
      const prefilled = customEvent.detail.message;
      setTimeout(() => {
        sendMessage(prefilled, language, userInfo);
      }, 300);
    }
  }, [language, sendMessage, userInfo]);

  useEffect(() => {
    document.addEventListener('openChatWidget', handleOpenChat);
    return () => document.removeEventListener('openChatWidget', handleOpenChat);
  }, [handleOpenChat]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || !userInfo) return;
    const content = inputValue.trim();
    setInputValue('');
    await sendMessage(content, language, userInfo);

    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEscalate = () => {
    window.location.href = '/chatbot?escalate=true';
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


  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            data-chat-widget="true"
            className="fixed bottom-[4.5rem] left-2 right-2 sm:bottom-24 sm:left-auto sm:right-6 z-50 w-auto sm:w-[400px] h-[calc(100dvh-6rem)] sm:h-[500px] bg-white border border-[#262522] border-t-0 shadow-[0_18px_48px_rgb(0_0_0/0.28)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gov-stripe" aria-hidden="true" />
            <div className="bg-black px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/images/osc-logo.png" alt="" width={28} height={28} className="w-7 h-7" />
                <h3 className="text-white font-bold text-sm">Investment assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 p-1 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gate: signed-in users only */}
            {!userInfo ? (
              <AssistantSignInGate language={language} />            ) : (
              <>
                {/* Chat messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <Image src="/images/osc-logo.png" alt="" width={64} height={64} className="w-16 h-16 mb-4" />
                      <h4 className="text-lg font-semibold text-black mb-2">
                        Welcome to UIA Assistant
                      </h4>
                      <p className="text-sm text-neutral-700">
                        Ask me anything about investing in Uganda
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map(message => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 bg-white px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your question..."
                      maxLength={2000}
                      className="flex-1 min-h-10 px-3 py-2 border-2 border-[#262522] text-sm text-black placeholder-[#75706a] bg-white"
                      disabled={isTyping}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="grid h-10 w-10 place-items-center bg-black text-white hover:bg-[#262522] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    {voice.isSupported && (
                      <button
                        onClick={handleMicClick}
                        className={`p-2 rounded-full transition-colors ${
                          voice.isListening
                            ? 'bg-red-100 text-red-500 animate-pulse'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        aria-label={voice.isListening ? 'Stop listening' : 'Voice input'}
                        title={voice.isListening ? 'Stop listening' : 'Voice input'}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEscalate}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-[#ce1126] text-[#9a0d1c] hover:bg-[#fdf1f2] transition-colors text-xs font-bold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Escalate to Officer
                    </button>
                    <Link
                      href="/chatbot"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[#ebe8e1] text-black hover:bg-[#dcd8cf] transition-colors text-xs font-bold"
                      onClick={() => setIsOpen(false)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Full Chat
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip Bubble */}
      <AnimatePresence>
        {showTooltip && !isOpen && !footerVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            data-chat-widget="true"
            className="fixed bottom-[4.5rem] right-4 sm:bottom-24 sm:right-6 z-50 bg-white shadow-xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-[180px] sm:max-w-[220px] border-2 border-black"
          >
            <p className="text-xs sm:text-sm font-medium text-gray-800">How can I help you invest?</p>
            <p className="text-[10px] sm:text-xs text-gray-700 mt-0.5 sm:mt-1">Ask me anything about Uganda</p>
            <div className="absolute -bottom-2 right-6 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 bg-white border-r-2 border-b-2 border-black rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        data-chat-widget="true"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center gap-2 w-12 h-12 sm:w-auto sm:h-12 bg-black text-white sm:px-5 shadow-[0_4px_0_#ffd700,0_10px_24px_rgb(0_0_0/0.25)] hover:bg-[#262522] ${
          hideLauncher ? 'pointer-events-none' : ''
        }`}
        // Opacity is animated through Framer rather than a Tailwind class:
        // this is a motion component, so Framer owns the inline style and a
        // competing `opacity-0` class just leaves it stuck mid-transition.
        animate={{ opacity: hideLauncher ? 0 : 1, y: hideLauncher ? 16 : 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden={hideLauncher}
        tabIndex={hideLauncher ? -1 : 0}
        whileHover={hideLauncher ? undefined : { scale: 1.05 }}
        whileTap={hideLauncher ? undefined : { scale: 0.95 }}
        aria-label="Toggle AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#ce1126] text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <span className="hidden sm:inline text-sm font-bold">
          {isOpen ? 'Close' : 'Ask the assistant'}
        </span>

      </motion.button>
    </>
  );
}
