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
  AlertCircle,
  User,
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import LanguageSelector from './LanguageSelector';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import type { ChatLanguage } from '@/types';
import type { ChatUserInfo } from '@/lib/chatbot-service';
import { useAuth } from '@/contexts/AuthContext';
import { useChatEngine } from '@/hooks/useChatEngine';
import { useVoiceInput } from '@/hooks/useVoiceInput';

const USER_INFO_KEY = 'uia-chat-user-info';

function loadUserInfo(): ChatUserInfo | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUserInfo(info: ChatUserInfo) {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  } catch {
    // silently ignore
  }
}

// Pre-chat form labels translated for all supported languages
const FORM_LABELS: Record<ChatLanguage, {
  title: string;
  subtitle: string;
  googlePrompt: string;
  orDivider: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  submit: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  locationPlaceholder: string;
}> = {
  en: {
    title: 'Welcome to UIA Assistant',
    subtitle: 'Sign in to get personalised investment assistance',
    googlePrompt: 'Quick & verified sign-in',
    orDivider: 'or continue without an account',
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    location: 'City / Country',
    submit: 'Start Chat',
    namePlaceholder: 'e.g. John Doe',
    emailPlaceholder: 'e.g. john@example.com',
    phonePlaceholder: 'e.g. +256-700-123456',
    locationPlaceholder: 'e.g. Kampala, Uganda',
  },
  fr: {
    title: "Bienvenue a l'assistant UIA",
    subtitle: "Connectez-vous pour une assistance personnalisee",
    googlePrompt: 'Connexion rapide et verifiee',
    orDivider: 'ou continuez sans compte',
    name: 'Nom complet',
    email: 'Adresse e-mail',
    phone: 'Numero de telephone',
    location: 'Ville / Pays',
    submit: 'Demarrer le chat',
    namePlaceholder: 'ex. Jean Dupont',
    emailPlaceholder: 'ex. jean@example.com',
    phonePlaceholder: 'ex. +256-700-123456',
    locationPlaceholder: 'ex. Kampala, Ouganda',
  },
  ar: {
    title: '\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643\u0645 \u0641\u064a \u0645\u0633\u0627\u0639\u062f UIA',
    subtitle: '\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u064a\u0629 \u0645\u062e\u0635\u0635\u0629',
    googlePrompt: '\u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644 \u0633\u0631\u064a\u0639 \u0648\u0645\u0648\u062b\u0642',
    orDivider: '\u0623\u0648 \u0627\u0633\u062a\u0645\u0631 \u0628\u062f\u0648\u0646 \u062d\u0633\u0627\u0628',
    name: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644',
    email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
    phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
    location: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629 / \u0627\u0644\u062f\u0648\u0644\u0629',
    submit: '\u0628\u062f\u0621 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629',
    namePlaceholder: '\u0645\u062b\u0627\u0644: \u0623\u062d\u0645\u062f \u0645\u062d\u0645\u062f',
    emailPlaceholder: 'ahmed@example.com',
    phonePlaceholder: '+256-700-123456',
    locationPlaceholder: '\u0643\u0645\u0628\u0627\u0644\u0627\u060c \u0623\u0648\u063a\u0646\u062f\u0627',
  },
  zh: {
    title: '\u6b22\u8fce\u4f7f\u7528UIA\u52a9\u624b',
    subtitle: '\u767b\u5f55\u4ee5\u83b7\u53d6\u4e2a\u6027\u5316\u6295\u8d44\u534f\u52a9',
    googlePrompt: '\u5feb\u901f\u9a8c\u8bc1\u767b\u5f55',
    orDivider: '\u6216\u4e0d\u4f7f\u7528\u8d26\u6237\u7ee7\u7eed',
    name: '\u59d3\u540d',
    email: '\u7535\u5b50\u90ae\u7bb1',
    phone: '\u7535\u8bdd\u53f7\u7801',
    location: '\u57ce\u5e02 / \u56fd\u5bb6',
    submit: '\u5f00\u59cb\u804a\u5929',
    namePlaceholder: '\u4f8b\u5982\uff1a\u5f20\u4e09',
    emailPlaceholder: 'zhang@example.com',
    phonePlaceholder: '+256-700-123456',
    locationPlaceholder: '\u574e\u5e15\u62c9\uff0c\u4e4c\u5e72\u8fbe',
  },
  sw: {
    title: 'Karibu kwa Msaidizi wa UIA',
    subtitle: 'Ingia ili kupata msaada wa uwekezaji',
    googlePrompt: 'Ingia kwa haraka na uthibitisho',
    orDivider: 'au endelea bila akaunti',
    name: 'Jina Kamili',
    email: 'Barua Pepe',
    phone: 'Nambari ya Simu',
    location: 'Jiji / Nchi',
    submit: 'Anza Mazungumzo',
    namePlaceholder: 'mfano: Juma Ali',
    emailPlaceholder: 'juma@example.com',
    phonePlaceholder: '+256-700-123456',
    locationPlaceholder: 'Kampala, Uganda',
  },
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, sendMessage } = useChatEngine();
  const { user, isAuthenticated } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(false);

  // Pre-chat form state
  const [userInfo, setUserInfo] = useState<ChatUserInfo | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showManualForm, setShowManualForm] = useState(false);

  const voice = useVoiceInput(language);

  // Auto-set userInfo from Google auth when user signs in
  useEffect(() => {
    if (isAuthenticated && user && !userInfo) {
      const info: ChatUserInfo = {
        name: user.name,
        email: user.email,
      };
      setUserInfo(info);
      saveUserInfo(info);
    }
  }, [isAuthenticated, user, userInfo]);

  // Load saved user info and language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('chatLanguage') as ChatLanguage;
    if (savedLanguage) setLanguage(savedLanguage);
    const saved = loadUserInfo();
    if (saved) setUserInfo(saved);
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

  // When Google sign-in completes, auto-set userInfo
  const handleGoogleSuccess = () => {
    // Auth context will update → the useEffect above handles setting userInfo
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.email.trim()) {
      errors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Invalid email';
    }
    if (!formData.phone.trim()) errors.phone = 'Required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const info: ChatUserInfo = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim() || undefined,
    };
    setUserInfo(info);
    saveUserInfo(info);
    setFormErrors({});
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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

  const labels = FORM_LABELS[language] || FORM_LABELS.en;

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
            className="fixed bottom-[4.5rem] left-2 right-2 sm:bottom-24 sm:left-auto sm:right-6 z-50 w-auto sm:w-[400px] h-[calc(100dvh-6rem)] sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
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

            {/* Gate: require identification before chat */}
            {!userInfo ? (
              <div className="flex-1 overflow-y-auto p-4 bg-neutral-900">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">{labels.title}</h4>
                  <p className="text-sm text-neutral-400 mt-1">{labels.subtitle}</p>
                </div>

                {/* Primary: Google Sign-In */}
                {!showManualForm && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-500 text-center">{labels.googlePrompt}</p>
                    <GoogleSignInButton onSuccess={handleGoogleSuccess} />

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-neutral-700" />
                      <span className="text-xs text-neutral-500">{labels.orDivider}</span>
                      <div className="flex-1 h-px bg-neutral-700" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowManualForm(true)}
                      className="w-full py-2.5 bg-neutral-800 text-neutral-300 font-medium rounded-lg hover:bg-neutral-700 transition-colors text-sm border border-neutral-700"
                    >
                      {labels.submit}
                    </button>
                  </div>
                )}

                {/* Fallback: Manual Form */}
                {showManualForm && (
                  <form onSubmit={handleFormSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        {labels.name} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder={labels.namePlaceholder}
                        maxLength={100}
                        className={`w-full px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm placeholder-neutral-500 border ${
                          formErrors.name ? 'border-red-500' : 'border-neutral-700'
                        } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                      />
                      {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        {labels.email} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder={labels.emailPlaceholder}
                        maxLength={200}
                        className={`w-full px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm placeholder-neutral-500 border ${
                          formErrors.email ? 'border-red-500' : 'border-neutral-700'
                        } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                      />
                      {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        {labels.phone} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder={labels.phonePlaceholder}
                        maxLength={30}
                        className={`w-full px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm placeholder-neutral-500 border ${
                          formErrors.phone ? 'border-red-500' : 'border-neutral-700'
                        } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                      />
                      {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        {labels.location}
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                        placeholder={labels.locationPlaceholder}
                        maxLength={200}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm placeholder-neutral-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowManualForm(false)}
                        className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 font-medium rounded-lg hover:bg-neutral-700 transition-colors text-sm border border-neutral-700"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                      >
                        {labels.submit}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <>
                {/* Chat messages area */}
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
              </>
            )}
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
            className="fixed bottom-[4.5rem] right-4 sm:bottom-24 sm:right-6 z-50 bg-white rounded-xl shadow-xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-[180px] sm:max-w-[220px] border border-yellow-300"
          >
            <p className="text-xs sm:text-sm font-medium text-gray-800">How can I help you invest?</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Ask me anything about Uganda</p>
            <div className="absolute -bottom-2 right-6 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 bg-white border-r border-b border-yellow-300 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center gap-2 w-12 h-12 sm:w-auto sm:h-14 bg-yellow-500 text-black rounded-full shadow-lg shadow-yellow-500/25 hover:shadow-yellow-400/40 transition-all duration-300 sm:px-5 ring-2 ring-yellow-400/20 sm:ring-4 hover:ring-yellow-400/40"
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
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <span className="hidden sm:inline text-sm font-bold">
          {isOpen ? '' : 'Ask Assistant'}
        </span>

        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-500 hidden sm:block"
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
