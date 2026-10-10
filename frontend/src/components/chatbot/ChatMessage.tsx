'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

// Reveals text word-by-word for a "typing" effect. Runs once per message
// (guarded by a ref) so re-renders don't restart it; messages that aren't
// flagged `animate` render their full content immediately.
function useTypewriter(content: string, enabled: boolean): { text: string; done: boolean } {
  const [text, setText] = useState(enabled ? '' : content);
  const [done, setDone] = useState(!enabled);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;

    // Split into tokens that keep whitespace, so joining a prefix rebuilds
    // the text exactly (word, space, word, …).
    const tokens = content.split(/(\s+)/);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setText(tokens.slice(0, i).join(''));
      if (i >= tokens.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, 28); // ~28ms per token

    return () => clearInterval(timer);
  }, [content, enabled]);

  return { text, done };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const { text: typedContent, done: typingDone } = useTypewriter(
    message.content,
    !isUser && !isSystem && Boolean(message.animate),
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return timeString;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeString}`;
  };

  // Typing indicator
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex gap-3 py-4"
      >
        <Image src="/images/osc-logo.png" alt="" width={32} height={32} className="flex-shrink-0 w-8 h-8" />
        <div className="flex items-center gap-1.5 pt-1">
          <motion.span
            className="w-2 h-2 bg-[#ffd700] rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-[#ffd700] rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
          />
          <motion.span
            className="w-2 h-2 bg-[#ce1126] rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.6 }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 py-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isUser
            ? 'bg-white border border-neutral-200'
            : ''
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-neutral-700" />
        ) : (
          <Image src="/images/osc-logo.png" alt="" width={32} height={32} className="w-8 h-8" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <p className={`text-xs font-semibold mb-1 ${isUser ? 'text-neutral-600' : 'text-[#9a0d1c]'}`}>
          {isUser ? 'You' : 'UIA Assistant'}
        </p>
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'inline-block text-left bg-white border border-neutral-200 text-neutral-700 border-r-4 border-r-black px-4 py-3'
              : 'text-black'
          }`}
        >
          {isUser ? message.content : typedContent}
          {!isUser && !typingDone && (
            <motion.span
              aria-hidden="true"
              className="inline-block w-[2px] h-4 -mb-0.5 ml-0.5 bg-black align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
          )}
        </div>
        <p className="text-[11px] text-neutral-700 mt-1.5">
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
