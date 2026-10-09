'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { useRouter } from 'next/navigation';
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
  const { isAuthenticated, user, isLoading: authLoading, refreshUser, logout } = useAuth();
  const router = useRouter();

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
  // The active session's token was issued before enrolment and still carries
  // mfa_enabled=false — it only picks up the new claim on the next login, so
  // enabling MFA here doesn't unlock the dashboard until the user re-signs in.
  const [justEnrolledMfa, setJustEnrolledMfa] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
      setJustEnrolledMfa(true);
    } catch {
      setMfaError('Network error — please try again');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleSignOutToApply = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.push('/login');
    } catch {
      setSigningOut(false);
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
      setJustEnrolledMfa(false);
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
      <div className="gov-container py-24">
        <p role="status" className="flex items-center gap-3 text-[#3b3934]">
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
          Loading your profile…
        </p>
      </div>
    );
  }

  // Any signed-in account (admins and regular users) can view their profile.
  if (!isAuthenticated) {
    return (
      <PageHeader
        crumbs={[{ label: 'Your profile' }]}
        caption="Your account"
        title="Your profile"
        lead="Sign in to view and update your profile."
        actions={<Link href="/" className="gov-btn">Return to the homepage</Link>}
      />
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
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Your profile' }]}
        caption="Your account"
        title="Your profile"
        lead="Your personal details, password and sign-in security."
      />
      <div className="gov-container max-w-3xl py-12">
        {mfaSetupRequired && (
          <div role="alert" className="gov-inset gov-inset--red mb-8 flex items-start gap-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-[#ce1126] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-black">Set up two-factor authentication to continue</p>
              <p className="text-sm text-[#3b3934] mt-1">
                Back-office accounts now require MFA. Scan the QR code below with an authenticator app and enter
                a code to unlock the dashboard and staff tools again.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10 border-t-4 border-black">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center flex-shrink-0 rounded-full bg-black">
              <span className="font-display text-2xl font-semibold text-[#ffd700]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-black truncate">{user?.name}</h1>
              <p className="text-neutral-600">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="gov-tag gov-tag--gold inline-flex items-center gap-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-10 border-t-4 border-black">
          <div className="flex items-center justify-between border-b border-[#dcd8cf] py-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-black">
              <UserCircleIcon className="w-5 h-5 text-neutral-600" />
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="gov-link text-[15px]"
              >
                Edit
              </button>
            )}
          </div>
          <div className="space-y-4 py-6">
            {profileSuccess && (
              <div role="status" className="gov-inset flex items-center gap-2 text-sm font-semibold">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div role="alert" className="gov-inset gov-inset--red flex items-center gap-2 text-sm font-semibold">
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                {profileError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gov-input"
                  autoFocus
                />
              ) : (
                <p className="text-black font-medium">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Email</label>
              <p className="text-black">{user?.email}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Role</label>
              <p className="text-black capitalize">{user?.role}</p>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="gov-btn gov-btn--sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-5 py-2 bg-neutral-100 text-neutral-800 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="mb-10 border-t-4 border-black">
          <div className="flex items-center justify-between border-b border-[#dcd8cf] py-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-black">
              <LockClosedIcon className="w-5 h-5 text-neutral-600" />
              Security
            </h2>
            {!showPasswordForm && (
              <button
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="gov-link text-[15px]"
              >
                Change Password
              </button>
            )}
          </div>
          <div className="py-6">
            {passwordSuccess && (
              <div role="status" className="gov-inset mb-4 flex items-center gap-2 text-sm font-semibold">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div role="alert" className="gov-inset gov-inset--red flex items-center gap-2 text-sm font-semibold">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="gov-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="gov-input"
                  />
                </div>
                <div>
                  <label className="gov-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="gov-input"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="gov-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="gov-input"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="gov-btn gov-btn--sm"
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
                    className="px-5 py-2 bg-neutral-100 text-neutral-800 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-800 text-sm">Password</span>
                  <span className="text-neutral-500 text-sm">Last set at account creation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-800 text-sm">Session</span>
                  <span className="text-black text-sm font-medium">Active (24h token)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two-factor authentication (back-office roles only) */}
        {canUseMfa && (
          <div className="mb-10 border-t-4 border-black">
            <div className="flex items-center justify-between border-b border-[#dcd8cf] py-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-black">
                <DevicePhoneMobileIcon className="w-5 h-5 text-neutral-600" />
                Two-Factor Authentication
              </h2>
              {mfaStatusLoaded && (
                <span
                  className={`gov-tag ${mfaEnabled ? '' : 'gov-tag--red'}`}
                >
                  {mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
            <div className="py-6">
              {mfaSuccess && (
                <div role="status" className="gov-inset mb-4 flex items-center gap-2 text-sm font-semibold">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  {mfaSuccess}
                </div>
              )}
              {mfaError && (
                <div className="flex items-center gap-2 py-2 mb-4 border-l-4 border-red-600 pl-4 text-sm text-red-700">
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                  {mfaError}
                </div>
              )}

              {!mfaStatusLoaded ? (
                <p className="text-sm text-neutral-600">Loading…</p>
              ) : mfaEnabled ? (
                showDisable ? (
                  <form onSubmit={handleDisableMfa} className="space-y-4">
                    <p className="text-sm text-neutral-700">
                      Confirm your password and a current authentication code to turn off two-factor authentication.
                    </p>
                    <div>
                      <label className="gov-label">Current Password</label>
                      <input
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        required
                        className="gov-input"
                      />
                    </div>
                    <div>
                      <label className="gov-label">Authentication Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                        required
                        className="gov-input w-40 tracking-[0.4em] text-center"
                        placeholder="000000"
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={mfaBusy || disableCode.length !== 6}
                        className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {mfaBusy ? 'Disabling…' : 'Disable 2FA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDisable(false); setDisablePassword(''); setDisableCode(''); setMfaError(''); }}
                        disabled={mfaBusy}
                        className="px-5 py-2 bg-neutral-100 text-neutral-800 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {justEnrolledMfa && (
                      <div className="flex items-start gap-3 border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-black">Sign out and sign back in to finish</p>
                          <p className="text-sm text-[#3b3934] mt-1">
                            Your current session was issued before 2FA was enabled, so the dashboard and staff
                            tools will keep asking for setup until you start a new session. Sign out now and log
                            back in — you&apos;ll be prompted for your authenticator code.
                          </p>
                          <button
                            onClick={handleSignOutToApply}
                            disabled={signingOut}
                            className="gov-btn gov-btn--sm mt-3"
                          >
                            {signingOut ? 'Signing out…' : 'Sign out now'}
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-neutral-700">
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
                  <ol className="text-sm text-neutral-700 list-decimal list-inside space-y-1">
                    <li>Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator…).</li>
                    <li>Add an account and enter this setup key manually:</li>
                  </ol>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md font-mono text-sm text-black break-all tracking-wider">
                      {enroll.secret.replace(/(.{4})/g, '$1 ').trim()}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="px-3 py-2 bg-neutral-100 text-neutral-800 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      {secretCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div>
                    <label className="gov-label">
                      Enter the 6-digit code to confirm
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="gov-input w-40 tracking-[0.4em] text-center"
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={mfaBusy || mfaCode.length !== 6}
                      className="gov-btn gov-btn--sm"
                    >
                      {mfaBusy ? 'Verifying…' : 'Verify & Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEnroll(null); setMfaCode(''); setMfaError(''); }}
                      disabled={mfaBusy}
                      className="px-5 py-2 bg-neutral-100 text-neutral-800 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-700">
                    Add an extra layer of security by requiring a time-based code from an authenticator app at sign-in.
                  </p>
                  <button
                    onClick={handleStartEnroll}
                    disabled={mfaBusy}
                    className="gov-btn gov-btn--sm"
                  >
                    {mfaBusy ? 'Starting…' : 'Enable two-factor authentication'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="border-t-4 border-black pt-4">
          <h2 className="mb-4 text-xl font-bold text-black">Quick links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="border-l-4 border-black bg-[#f5f3ee] px-4 py-3 text-[15px] font-bold text-black underline-offset-4 hover:bg-[#ebe8e1] hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/agency-chat"
              className="border-l-4 border-black bg-[#f5f3ee] px-4 py-3 text-[15px] font-bold text-black underline-offset-4 hover:bg-[#ebe8e1] hover:underline"
            >
              Agency Chat
            </Link>
            <Link
              href="/tickets"
              className="border-l-4 border-black bg-[#f5f3ee] px-4 py-3 text-[15px] font-bold text-black underline-offset-4 hover:bg-[#ebe8e1] hover:underline"
            >
              Tickets
            </Link>
            <Link
              href="/projects"
              className="border-l-4 border-black bg-[#f5f3ee] px-4 py-3 text-[15px] font-bold text-black underline-offset-4 hover:bg-[#ebe8e1] hover:underline"
            >
              Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
