'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: string;
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stable refs for callbacks — prevents re-render loops
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Load the Google Identity Services script (runs once)
  useEffect(() => {
    if (!clientId) return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.getElementById('google-gsi-script');
    if (existing) {
      existing.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onErrorRef.current?.('Failed to load Google Sign-In');
    document.head.appendChild(script);
  }, [clientId]);

  // Initialize Google Sign-In when script is loaded (runs once)
  useEffect(() => {
    if (!scriptLoaded || !clientId || !buttonRef.current || !window.google || initializedRef.current) return;
    initializedRef.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setLoading(true);
        try {
          await loginWithGoogle(response.credential);
          onSuccessRef.current?.();
        } catch (err) {
          onErrorRef.current?.(err instanceof Error ? err.message : 'Google sign-in failed');
        } finally {
          setLoading(false);
        }
      },
    });

    // Use container width so button fits in both login page and chat widget
    const containerWidth = Math.min(buttonRef.current.offsetWidth || 300, 400);
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: containerWidth,
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'center',
    });
  }, [scriptLoaded, clientId, loginWithGoogle]);

  if (!clientId) {
    return (
      <div className="w-full">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-400 shadow-sm cursor-not-allowed"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google Sign-In not configured
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-2.5 text-sm text-gray-500">
          Verifying with Google...
        </div>
      )}
      <div
        ref={buttonRef}
        className={`${disabled || loading ? 'opacity-50 pointer-events-none' : ''} flex justify-center [&>div]:w-full [&_iframe]:!w-full`}
      />
      {!scriptLoaded && clientId && (
        <div className="flex items-center justify-center py-2.5">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
