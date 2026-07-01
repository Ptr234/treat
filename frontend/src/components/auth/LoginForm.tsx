'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  // MFA (TOTP) step — shown after a correct password when the admin has MFA on.
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSubmitting, setMfaSubmitting] = useState(false);

  // Password reset state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'token'>('email');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const result = await login(formData.email, formData.password);
      if (result?.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setMfaSubmitting(true);
    try {
      await login(formData.email, formData.password, mfaCode.trim());
      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid authentication code');
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    const res = await apiFetch('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: resetEmail }),
    });
    setResetLoading(false);
    if (res.success) {
      setResetMessage('If that email exists, a reset link has been sent. Check your inbox.');
      setResetStep('token');
    } else {
      setResetError(res.error || 'Failed to send reset email');
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    const res = await apiFetch('/api/auth/password-reset/verify', {
      method: 'POST',
      body: JSON.stringify({ token: resetToken, newPassword: resetPassword }),
    });
    setResetLoading(false);
    if (res.success) {
      setResetMessage('Password reset successful. You can now sign in.');
      setTimeout(() => {
        setShowReset(false);
        setResetStep('email');
        setResetEmail('');
        setResetToken('');
        setResetPassword('');
        setResetMessage('');
      }, 2000);
    } else {
      setResetError(res.error || 'Invalid or expired reset token');
    }
  };

  if (showReset) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {resetStep === 'email' ? 'Reset Password' : 'Enter Reset Token'}
        </h3>

        {resetStep === 'email' ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a password reset link.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              placeholder="admin@uia.go.ug"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
            {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-2 px-4 bg-yellow-600 text-black font-semibold rounded-md hover:bg-yellow-500 disabled:opacity-50"
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the reset token from your email and your new password.
            </p>
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
              placeholder="Paste reset token from email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              required
              placeholder="New password (min 8 chars)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
            {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-2 px-4 bg-yellow-600 text-black font-semibold rounded-md hover:bg-yellow-500 disabled:opacity-50"
            >
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <button
          onClick={() => { setShowReset(false); setResetStep('email'); setResetError(''); setResetMessage(''); }}
          className="text-sm text-yellow-700 hover:text-yellow-600"
        >
          &larr; Back to sign in
        </button>
      </div>
    );
  }

  if (mfaRequired) {
    return (
      <form onSubmit={handleMfaSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Two-factor authentication</h3>
          <p className="text-sm text-gray-600 mt-1">
            Enter the 6-digit code from your authenticator app to finish signing in.
          </p>
        </div>
        <div>
          <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700">
            Authentication code
          </label>
          <input
            type="text"
            name="mfaCode"
            id="mfaCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            value={mfaCode}
            onChange={(e) => { setMfaCode(e.target.value.replace(/\D/g, '')); setFormError(''); }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm tracking-[0.5em] text-center text-lg focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-black placeholder-gray-400"
            placeholder="000000"
          />
        </div>
        {formError && <div className="text-red-600 text-sm">{formError}</div>}
        <button
          type="submit"
          disabled={mfaSubmitting || mfaCode.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        >
          {mfaSubmitting ? 'Verifying...' : 'Verify & Sign In'}
        </button>
        <button
          type="button"
          onClick={() => { setMfaRequired(false); setMfaCode(''); setFormError(''); }}
          className="text-sm text-yellow-700 hover:text-yellow-600"
        >
          &larr; Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email" name="email" id="email" required
          value={formData.email} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-black placeholder-gray-400"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="text-xs text-yellow-700 hover:text-yellow-600 font-medium"
          >
            Forgot password?
          </button>
        </div>
        <input
          type="password" name="password" id="password" required
          value={formData.password} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-black placeholder-gray-400"
        />
      </div>
      {formError && <div className="text-red-600 text-sm">{formError}</div>}
      <button
        type="submit" disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}