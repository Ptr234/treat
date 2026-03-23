'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatLanguage } from '@/types';

const LOCALE_MAP: Record<ChatLanguage, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-SA',
  zh: 'zh-CN',
  sw: 'sw-KE',
};

export interface VoiceInputResult {
  isListening: boolean;
  isSupported: boolean;
  startListening: (onResult: (transcript: string) => void) => void;
  stopListening: () => void;
}

export function useVoiceInput(language: ChatLanguage): VoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef<((transcript: string) => void) | null>(null);

  useEffect(() => {
    const supported = typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!isSupported) return;

    // Stop any existing session
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LOCALE_MAP[language] || 'en-US';

    onResultRef.current = onResult;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript && onResultRef.current) {
        onResultRef.current(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
