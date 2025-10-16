'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/contexts/NotificationContext';
import { PlusIcon } from '@heroicons/react/24/outline';

interface FloatingAction {
  label: string;
  icon: string;
  action: () => void;
}

export default function FloatingActionButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const { showNotification } = useNotification();

  const actions: FloatingAction[] = [
    {
      label: 'Emergency Support',
      icon: '🚨',
      action: () => {
        // Direct phone call
        window.location.href = 'tel:+256775692335';
        setIsOpen(false);
      }
    },
    {
      label: 'Quick Chat',
      icon: '💬',
      action: () => {
        showNotification(
          'Live chat is available Mon-Fri, 9AM-4PM',
          'info',
          'Chat Support'
        );
        setIsOpen(false);
      }
    },
    {
      label: 'Feedback',
      icon: '📝',
      action: () => {
        setIsOpen(false);
        // Show feedback form using custom event
        document.dispatchEvent(new CustomEvent('openFeedbackForm'));
      }
    }
  ];

  return (
    <div className="fixed bottom-20 left-4 z-40 md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-3 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.action}
                className="flex items-center bg-white text-gray-700 px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors group text-sm"
              >
                <span className="mr-2 text-base">{action.icon}</span>
                <span className="font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-colors ${
          isOpen ? 'rotate-45' : ''
        }`}
        style={{ transition: 'transform 0.2s ease' }}
      >
        <PlusIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
}