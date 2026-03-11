'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import GoogleSignInButton from './GoogleSignInButton';
import { XMarkIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'user' | 'admin';
}

export default function AuthModal({ isOpen, onClose, mode = 'admin' }: AuthModalProps) {
  const { isLoading, clearError } = useAuth();
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    if (isOpen) {
      clearError();
      setGoogleError('');
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const isUser = mode === 'user';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {isUser ? 'Sign In' : 'Admin Sign In'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {isUser ? (
            /* ─── User mode: Google Sign-In only ─── */
            <>
              <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <UserCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Sign in to access the AI Investment Assistant and personalised services.
                </p>
              </div>

              <GoogleSignInButton
                onSuccess={onClose}
                onError={(error) => setGoogleError(error)}
                disabled={isLoading}
              />

              {googleError && (
                <div className="mt-2 text-red-600 text-sm text-center">
                  {googleError}
                </div>
              )}
            </>
          ) : (
            /* ─── Admin mode: Google + Email/Password ─── */
            <>
              <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Authorized UIA administrators only.
                </p>
              </div>

              <GoogleSignInButton
                onSuccess={onClose}
                onError={(error) => setGoogleError(error)}
                disabled={isLoading}
              />

              {googleError && (
                <div className="mt-2 text-red-600 text-sm text-center">
                  {googleError}
                </div>
              )}

              <div className="flex items-center my-5">
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-3 text-sm text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              <LoginForm onSuccess={onClose} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
