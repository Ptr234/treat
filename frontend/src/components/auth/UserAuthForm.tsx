'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface UserAuthFormProps {
  onSuccess: () => void;
}

/**
 * Email + password sign-in / sign-up form for regular (non-admin) users.
 * Toggles between logging into an existing account and creating a new one.
 */
export default function UserAuthForm({ onSuccess }: UserAuthFormProps) {
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(name.trim(), email.trim(), password);
        setNotice('Check your email for a verification link. You will choose your final password when you verify.');
        return;
      } else {
        const result = await login(email.trim(), password);
        if (result?.mfaRequired) {
          setError('This account uses two-factor authentication. Please sign in via the Admin sign-in.');
          return;
        }
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === 'signup' && (
        <div>
          <label className="gov-label">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="gov-input"
            placeholder="Jane Investor"
          />
        </div>
      )}

      <div>
        <label className="gov-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="gov-input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="gov-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="gov-input"
          placeholder={mode === 'signup' ? 'At least 8 chars, 1 uppercase, 1 digit' : '••••••••'}
        />
      </div>

      {error && <p className="gov-inset gov-inset--red text-sm font-semibold" role="alert">{error} <Link className="underline" href="/auth/verify-email">Resend verification link</Link></p>}
      {notice && <p className="gov-inset text-sm font-semibold" role="status">{notice} <Link className="underline" href="/auth/verify-email">Verification help</Link></p>}

      <button
        type="submit"
        disabled={busy}
        className="gov-btn w-full"
      >
        {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-sm text-[#3b3934]">
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError('');
            setNotice('');
          }}
          className="gov-link"
        >
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </form>
  );
}
