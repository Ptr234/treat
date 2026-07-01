'use client';

import React, { useState } from 'react';
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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Jane Investor"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          placeholder={mode === 'signup' ? 'At least 8 chars, 1 uppercase, 1 digit' : '••••••••'}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full px-4 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-60 transition-colors"
      >
        {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-sm text-center text-gray-600">
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError('');
          }}
          className="font-semibold text-yellow-700 hover:text-yellow-800"
        >
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </form>
  );
}
