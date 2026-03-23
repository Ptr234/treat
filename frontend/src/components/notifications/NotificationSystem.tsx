'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification, type Notification } from '@/contexts/NotificationContext';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!notification.duration || notification.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, notification.duration! - elapsed);
        const progressValue = (remaining / notification.duration!) * 100;
        setProgress(progressValue);

        if (remaining <= 0) {
          clearInterval(interval);
          onRemove(notification.id);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [notification.duration, notification.id, onRemove, isPaused]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-lg border shadow-lg ${getColorClasses()} max-w-sm w-full`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {notification.message}
            </p>
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      action.variant === 'primary'
                        ? 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onRemove(notification.id)}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default function NotificationSystem() {
  const { notifications, removeNotification, clearAllNotifications } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {/* Clear all button */}
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={clearAllNotifications}
            className="text-xs text-gray-500 hover:text-gray-700 bg-white px-3 py-1 rounded-full shadow-md border"
          >
            Clear All ({notifications.length})
          </button>
        </div>
      )}
      
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}