'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import LanguageSelector from './LanguageSelector';
import type { ChatLanguage } from '@/types';
import { useChatEngine } from '@/hooks/useChatEngine';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, sendMessage } = useChatEngine();
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(false);

  const voice = useVoiceInput(language);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('chatLanguage') as ChatLanguage;
    if (savedLanguage) setLanguage(savedLanguage);
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
      inputRef.current?.focus();
    }
  }, [isOpen]);

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

  // Listen for custom event to open chat from other components
  const handleOpenChat = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<{ message?: string }>;
    setIsOpen(true);
    setShowTooltip(false);

    if (customEvent.detail?.message) {
      const prefilled = customEvent.detail.message;
      setTimeout(() => {
        sendMessage(prefilled, language);
      }, 300);
    }
  }, [language, sendMessage]);

  useEffect(() => {
    document.addEventListener('openChatWidget', handleOpenChat);
    return () => document.removeEventListener('openChatWidget', handleOpenChat);
  }, [handleOpenChat]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    const content = inputValue.trim();
    setInputValue('');
    await sendMessage(content, language);

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
    // Direct to full chatbot page with escalation form
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
            className="fixed bottom-28 left-2 right-2 sm:left-auto sm:right-6 z-50 w-auto sm:w-[400px] h-[calc(100dvh-8rem)] sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-black px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-semibold text-sm">AI Investment Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-neutral-900">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Welcome to UIA Assistant
                  </h4>
                  <p className="text-sm text-neutral-400">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-black text-yellow-400 p-2 rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  Escalate to Officer
                </button>
                <Link
                  href="/chatbot"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-xs font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Chat
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip Bubble */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-28 right-6 z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-[220px] border border-yellow-300"
          >
            <p className="text-sm font-medium text-gray-800">How can I help you invest?</p>
            <p className="text-xs text-gray-500 mt-1">Ask me anything about Uganda</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-yellow-300 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 h-16 bg-yellow-500 text-black rounded-full shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 px-5 ring-4 ring-yellow-400/20 hover:ring-yellow-400/40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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
              <X className="w-7 h-7" />
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
              <MessageCircle className="w-7 h-7" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <span className="hidden sm:inline text-sm font-bold">
          {isOpen ? '' : 'Ask AI'}
        </span>

        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-500"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
    </>
  );
}
