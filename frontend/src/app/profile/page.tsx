'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import { isStaff } from '@/lib/roles';
import {
  UserCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { isAuthenticated, user, isLoading: authLoading, refreshUser } = useAuth();

  // Set when middleware redirected here because a back-office session hasn't
  // completed MFA enrolment yet (?mfa=required) — read client-side to avoid
  // pulling useSearchParams (and its Suspense requirement) into this page.
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mfa') === 'required') {
      setMfaSetupRequired(true);
    }
  }, []);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Multi-factor authentication — every back-office role (admin, dg,
  // agency_officer) has an admin_users record and may enrol; matches the
  // backend's ResolveAdminAsync, which accepts the same set of roles.
  const canUseMfa = isStaff(user?.role);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaStatusLoaded, setMfaStatusLoaded] = useState(false);
  const [enroll, setEnroll] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  // Disable-MFA form
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  const loadMfaStatus = useCallback(async () => {
    const res = await apiFetch<{ enabled: boolean }>('/api/auth/mfa/status');
    if (res.success && res.data) setMfaEnabled(res.data.enabled);
    setMfaStatusLoaded(true);
  }, []);

  useEffect(() => {
    if (canUseMfa) loadMfaStatus();
  }, [canUseMfa, loadMfaStatus]);

  const handleStartEnroll = async () => {
    setMfaError('');
    setMfaSuccess('');
    setMfaBusy(true);
    try {
      const res = await apiFetch<{ secret: string; otpauthUri: string }>('/api/auth/mfa/enroll', { method: 'POST' });
      if (!res.success || !res.data) {
        setMfaError(res.error || 'Could not start enrolment');
        return;
      }
      setEnroll(res.data);
      setMfaCode('');
    } catch {
      setMfaError('Network error — please try again');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleVerifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setMfaBusy(true);
    try {
      const res = await apiFetch('/api/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: mfaCode.trim() }),
      });
      if (!res.success) {
        setMfaError(res.error || 'Invalid authentication code');
        return;
      }
      setMfaEnabled(true);
      setEnroll(null);
      setMfaCode('');
      setMfaSuccess('Two-factor authentication is now enabled.');
      setTimeout(() => setMfaSuccess(''), 4000);
    } catch {
      setMfaError('Network error — please try again');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setMfaBusy(true);
    try {
      const res = await apiFetch('/api/auth/mfa/disable', {
        method: 'POST',
        body: JSON.stringify({ password: disablePassword, code: disableCode.trim() }),
      });
      if (!res.success) {
        setMfaError(res.error || 'Could not disable MFA');
        return;
      }
      setMfaEnabled(false);
      setShowDisable(false);
      setDisablePassword('');
      setDisableCode('');
      setMfaSuccess('Two-factor authentication has been disabled.');
      setTimeout(() => setMfaSuccess(''), 4000);
    } catch {
      setMfaError('Network error — please try again');
    } finally {
      setMfaBusy(false);
    }
  };

  const copySecret = async () => {
    if (!enroll) return;
    try {
      await navigator.clipboard.writeText(enroll.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  // While the session is resolving, show a loader rather than flashing the
  // "sign in" screen to a user who is actually authenticated.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // Any signed-in account (admins and regular users) can view their profile.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Profile</h1>
          <p className="text-gray-600 mb-6">Sign in to view your profile.</p>
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setName(user?.name || '');
    setIsEditing(true);
    setProfileError('');
    setProfileSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileError('');
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setProfileError('Name must be at least 2 characters');
      return;
    }
    if (trimmed === user?.name) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setProfileError('');
    try {
      const json = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
      if (!json.success) {
        setProfileError(json.error || 'Failed to update name');
        return;
      }
      await refreshUser();
      setIsEditing(false);
      setProfileSuccess('Name updated successfully');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch {
      setProfileError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const json = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!json.success) {
        setPasswordError(json.error || 'Failed to change password');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setPasswordSuccess('Password changed successfully');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch {
      setPasswordError('Network error — please try again');
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = (user?.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {mfaSetupRequired && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Set up two-factor authentication to continue</p>
              <p className="text-sm text-yellow-800 mt-1">
                Back-office accounts now require MFA. Scan the QR code below with an authenticator app and enter
                a code to unlock the dashboard and staff tools again.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-yellow-700">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-gray-500" />
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
              >
                Edit
              </button>
            )}
          </div>
          <div className="p-6 space-y-4">
            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                {profileError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  autoFocus
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-gray-500" />
              Security
            </h2>
            {!showPasswordForm && (
              <button
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
              >
                Change Password
              </button>
            )}
          </div>
          <div className="p-6">
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                    disabled={passwordSaving}
                    className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Password</span>
                  <span className="text-gray-400 text-sm">Last set at account creation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Session</span>
                  <span className="text-green-600 text-sm font-medium">Active (24h token)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two-factor authentication (back-office roles only) */}
        {canUseMfa && (
          <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-500" />
                Two-Factor Authentication
              </h2>
              {mfaStatusLoaded && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
            <div className="p-6">
              {mfaSuccess && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  {mfaSuccess}
                </div>
              )}
              {mfaError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                  {mfaError}
                </div>
              )}

              {!mfaStatusLoaded ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : mfaEnabled ? (
                showDisable ? (
                  <form onSubmit={handleDisableMfa} className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Confirm your password and a current authentication code to turn off two-factor authentication.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                        required
                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="000000"
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={mfaBusy || disableCode.length !== 6}
                        className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {mfaBusy ? 'Disabling…' : 'Disable 2FA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDisable(false); setDisablePassword(''); setDisableCode(''); setMfaError(''); }}
                        disabled={mfaBusy}
                        className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Your account is protected with an authenticator app. A code is required each time you sign in.
                    </p>
                    <button
                      onClick={() => { setShowDisable(true); setMfaError(''); setMfaSuccess(''); }}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Disable two-factor authentication
                    </button>
                  </div>
                )
              ) : enroll ? (
                <form onSubmit={handleVerifyEnroll} className="space-y-4">
                  <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                    <li>Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator…).</li>
                    <li>Add an account and enter this setup key manually:</li>
                  </ol>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-900 break-all tracking-wider">
                      {enroll.secret.replace(/(.{4})/g, '$1 ').trim()}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      {secretCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter the 6-digit code to confirm
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={mfaBusy || mfaCode.length !== 6}
                      className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                    >
                      {mfaBusy ? 'Verifying…' : 'Verify & Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEnroll(null); setMfaCode(''); setMfaError(''); }}
                      disabled={mfaBusy}
                      className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security by requiring a time-based code from an authenticator app at sign-in.
                  </p>
                  <button
                    onClick={handleStartEnroll}
                    disabled={mfaBusy}
                    className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    {mfaBusy ? 'Starting…' : 'Enable two-factor authentication'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-center"
            >
              Dashboard
            </Link>
            <Link
              href="/agency-chat"
              className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-center"
            >
              Agency Chat
            </Link>
            <Link
              href="/tickets"
              className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-center"
            >
              Tickets
            </Link>
            <Link
              href="/projects"
              className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-center"
            >
              Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
