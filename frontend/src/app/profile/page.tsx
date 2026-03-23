'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import {
  UserCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

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

  if (!isAdmin) {
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
        body: JSON.stringify({ password: newPassword }),
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
