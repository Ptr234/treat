'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatLanguage } from '@/types';
import { sendChatMessage } from '@/lib/chatbot-service';

const STORAGE_KEY = 'uia-chat-messages';
const MAX_PERSISTED = 50;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredChat {
  messages: ChatMessage[];
  timestamp: number;
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored: StoredChat = JSON.parse(raw);
    if (Date.now() - stored.timestamp > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return stored.messages;
  } catch {
    return [];
  }
}

function persistMessages(messages: ChatMessage[]) {
  try {
    const toStore: StoredChat = {
      messages: messages
        .filter(m => m.role !== 'system')
        .slice(-MAX_PERSISTED),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export interface ChatEngineResult {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string, language: ChatLanguage, sessionId?: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChatEngine(): ChatEngineResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const isSendingRef = useRef(false);
  const initializedRef = useRef(false);

  // Restore from localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const restored = loadMessages();
    if (restored.length > 0) setMessages(restored);
  }, []);

  // Persist on change (skip system/typing messages)
  useEffect(() => {
    if (initializedRef.current && messages.length > 0) {
      persistMessages(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (
    content: string,
    language: ChatLanguage,
    sessionId?: string,
  ) => {
    if (!content.trim() || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: 'system',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setIsTyping(true);

    try {
      const history = [...messages, userMessage]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const result = await sendChatMessage(content.trim(), history, language, sessionId);

      const response = typeof result === 'string' ? result : result.response;
      const sentiment = typeof result === 'string' ? undefined : result.sentiment;

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        sentiment,
      };

      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.role !== 'system');
        const updated = [...withoutTyping, assistantMessage];

        // On negative sentiment, append escalation suggestion
        if (sentiment === 'negative') {
          updated.push({
            id: `msg-${Date.now()}-suggest`,
            role: 'assistant',
            content:
              'It seems like you might need more personalized help. Would you like to **escalate this to an investment officer** who can assist you directly?\n\n' +
              'You can use the "Escalate to Officer" button, or visit the [full chat page](/chatbot?escalate=true) to submit your details.',
            timestamp: new Date().toISOString(),
          });
        }

        return updated;
      });
    } catch (error) {
      console.error('Chat engine error:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again, or contact UIA directly at +256-414-301000.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => prev.filter(m => m.role !== 'system').concat(errorMessage));
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, isTyping, sendMessage, clearMessages };
}
