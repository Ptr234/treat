'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type State = 'ready' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>('ready');
  const [message, setMessage] = useState('Choose a password to finish verifying your email address.');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) {
      setState('error');
      setMessage('This verification link is incomplete. Request a fresh link below.');
      return;
    }
    if (password !== confirmPassword) {
      setState('error');
      setMessage('The passwords do not match.');
      return;
    }

    setState('verifying');
    const result = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: password }),
    });
    setState(result.success ? 'success' : 'error');
    setMessage(result.success
      ? 'Your email address is verified. Sign in with the password you just chose.'
      : result.error ?? 'This verification link is invalid or has expired.');
  }

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResendMessage('Sending…');
    const result = await apiFetch('/api/auth/email-verification-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setResendMessage(result.success
      ? 'If the account needs verification, a link has been sent.'
      : result.error ?? 'The request could not be completed. Please try again.');
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">{state === 'success' ? 'Email verified' : 'Verify your email'}</h1>
      <p className="mt-4 text-gray-600" role="status">{message}</p>
      {state !== 'success' && (
        <form className="mt-6 flex w-full max-w-sm flex-col gap-3 text-left" onSubmit={verify}>
          <label className="text-sm font-medium" htmlFor="new-password">Choose a password</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} required
            value={password} onChange={(event) => setPassword(event.target.value)} className="rounded border px-3 py-2" />
          <label className="text-sm font-medium" htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required
            value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded border px-3 py-2" />
          <p className="text-xs text-gray-500">Use at least 8 characters, including one uppercase letter and one number.</p>
          <button disabled={state === 'verifying'} type="submit" className="rounded bg-black px-5 py-3 text-white disabled:opacity-60">
            {state === 'verifying' ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
      )}
      {state === 'error' && (
        <form className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left" onSubmit={resend}>
          <label className="text-sm font-medium" htmlFor="verification-email">Need a fresh link?</label>
          <input id="verification-email" type="email" autoComplete="email" required value={email}
            onChange={(event) => setEmail(event.target.value)} className="rounded border px-3 py-2" />
          <button type="submit" className="rounded border px-5 py-3">Send verification link</button>
          {resendMessage && <p className="text-sm text-gray-600" role="status">{resendMessage}</p>}
        </form>
      )}
      {state === 'success' && (
        <Link className="mt-6 rounded bg-black px-5 py-3 text-white" href="/login">
          Continue to sign in
        </Link>
      )}
    </main>
  );
}
