'use client';

import React, { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface EmailVerificationFormProps {
  email?: string;
  type?: 'registration' | 'login';
  onResendCode?: () => Promise<void>;
  onBack?: () => void;
  loading?: boolean;
}

export default function EmailVerificationForm({
  email,
  type = 'registration',
  onResendCode,
  onBack,
  loading = false
}: EmailVerificationFormProps) {
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    try {
      await onResendCode?.();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <EnvelopeIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {type === 'registration' ? 'Verify Your Email' : 'Verify Login'}
        </h2>
        <p className="text-gray-600 mt-2">
          We&apos;ve sent a verification link to
        </p>
        <p className="font-medium text-blue-600">{email}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Click the verification link in your email to complete
          {type === 'registration' ? ' registration' : ' sign-in'}.
          After verifying, return here and sign in.
        </p>
      </div>

      {resent && (
        <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md mb-4">
          Verification email resent successfully.
        </div>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resent}
              className={`font-medium ${
                !loading && !resent
                  ? 'text-blue-600 hover:text-blue-500 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Resend verification email
            </button>
          </p>
        </div>

        {onBack && (
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              &larr; Back to sign in
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Check your spam folder if you don&apos;t see the email</p>
      </div>
    </div>
  );
}
