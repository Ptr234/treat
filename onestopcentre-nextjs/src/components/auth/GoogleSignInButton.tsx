'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onSuccess?: (credential: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface GoogleAccountsConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  type?: 'standard' | 'icon';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  logo_alignment?: 'left' | 'center';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleAccountsConfig) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  disabled = false 
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (!window.google || isInitialized.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320
          }
        );
      }

      isInitialized.current = true;
    };

    const handleCredentialResponse = (response: { credential?: string }) => {
      if (response.credential) {
        onSuccess?.(response.credential);
      } else {
        onError?.('No credential received from Google');
      }
    };

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      initializeGoogleSignIn();
    }
  }, [onSuccess, onError]);

  return (
    <div className="w-full">
      <div 
        ref={buttonRef}
        className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: '40px' }}
      />
      {disabled && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          Complete the form above to enable Google Sign-In
        </p>
      )}
    </div>
  );
}