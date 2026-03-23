'use client';

import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-red-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Sparkles className="w-4 h-4 text-black" />
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <motion.span
            className="w-2 h-2 bg-yellow-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-yellow-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
          />
          <motion.span
            className="w-2 h-2 bg-red-500 rounded-full"
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
            ? 'bg-neutral-800 border border-neutral-700'
            : 'bg-gradient-to-br from-yellow-400 to-red-600 shadow-yellow-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-neutral-300" />
        ) : (
          <Sparkles className="w-4 h-4 text-black" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <p className={`text-xs font-semibold mb-1 ${isUser ? 'text-neutral-500' : 'text-yellow-500/80'}`}>
          {isUser ? 'You' : 'UIA Assistant'}
        </p>
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'inline-block text-left bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-2xl rounded-tr-sm px-4 py-3'
              : 'text-white'
          }`}
        >
          {message.content}
        </div>
        <p className="text-[11px] text-neutral-700 mt-1.5">
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
