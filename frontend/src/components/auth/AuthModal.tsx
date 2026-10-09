'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import UserAuthForm from './UserAuthForm';
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md max-h-screen overflow-y-auto bg-white shadow-[0_24px_60px_rgb(0_0_0/0.35)]">
        <div className="gov-stripe" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-3xl font-semibold text-black">
              {isUser ? 'Sign in' : 'Admin sign in'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close sign in"
              className="grid h-10 w-10 place-items-center text-black hover:bg-[#f5f3ee]"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {isUser ? (
            /* ─── User mode: Google Sign-In only ─── */
            <>
              <div className="gov-inset mb-6 flex items-start gap-3">
                <UserCircleIcon className="mt-0.5 w-5 h-5 text-black flex-shrink-0" />
                <p className="text-sm text-neutral-800">
                  Sign in to access the AI Investment Assistant and personalised services.
                </p>
              </div>

              <GoogleSignInButton
                onSuccess={onClose}
                onError={(error) => setGoogleError(error)}
                disabled={isLoading}
              />

              {googleError && (
                <div className="gov-inset gov-inset--red mt-3 text-sm font-semibold">
                  {googleError}
                </div>
              )}

              <div className="flex items-center my-5">
                <div className="flex-1 border-t border-[#b9b4a9]" />
                <span className="px-3 text-sm text-neutral-600">or</span>
                <div className="flex-1 border-t border-[#b9b4a9]" />
              </div>

              <UserAuthForm onSuccess={onClose} />
            </>
          ) : (
            /* ─── Admin mode: Google + Email/Password ─── */
            <>
              <div className="gov-inset gov-inset--red mb-6 flex items-start gap-3">
                <ShieldCheckIcon className="mt-0.5 w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-neutral-800">
                  Authorized UIA administrators only.
                </p>
              </div>

              <GoogleSignInButton
                onSuccess={onClose}
                onError={(error) => setGoogleError(error)}
                disabled={isLoading}
              />

              {googleError && (
                <div className="gov-inset gov-inset--red mt-3 text-sm font-semibold">
                  {googleError}
                </div>
              )}

              <div className="flex items-center my-5">
                <div className="flex-1 border-t border-[#b9b4a9]" />
                <span className="px-3 text-sm text-neutral-600">or</span>
                <div className="flex-1 border-t border-[#b9b4a9]" />
              </div>

              <LoginForm onSuccess={onClose} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
