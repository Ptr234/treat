import React, { useEffect, useRef } from 'react';

const GoogleSignInButton = ({ onSuccess, onError, disabled = false }) => {
  const buttonRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (!window.google || isInitialized.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
            width: '100%'
          }
        );
      }

      isInitialized.current = true;
    };

    const handleCredentialResponse = (response) => {
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
};

export default GoogleSignInButton;