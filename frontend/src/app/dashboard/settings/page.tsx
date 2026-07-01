'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, Cog6ToothIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { apiFetch } from '@/lib/api-client';

interface EscalationSettings {
  escalationEmails: string;
  defaultAssignee: string;
  escalationMessage: string;
}

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState<EscalationSettings>({
    escalationEmails: '',
    defaultAssignee: '',
    escalationMessage: 'A ticket has been escalated and requires immediate attention.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<EscalationSettings>('/api/settings/escalation');
      if (res.success && res.data) {
        setSettings({
          escalationEmails: res.data.escalationEmails || '',
          defaultAssignee: res.data.defaultAssignee || '',
          escalationMessage: res.data.escalationMessage || 'A ticket has been escalated and requires immediate attention.',
        });
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchSettings();
  }, [isAuthenticated, fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);

    // Validate emails
    if (settings.escalationEmails.trim()) {
      const emails = settings.escalationEmails.split(',').map(e => e.trim());
      const invalid = emails.find(e => !e.includes('@'));
      if (invalid) {
        setFeedback({ type: 'error', message: `Invalid email address: ${invalid}` });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await apiFetch('/api/settings/escalation', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Escalation settings saved successfully.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save settings.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !isAdminLevel(user?.role)) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
          </Link>
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="w-7 h-7 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold">Escalation Settings</h1>
              <p className="text-sm text-neutral-400">Configure who gets notified when tickets are escalated</p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-300'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {feedback.type === 'success'
              ? <CheckCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              : <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            }
            <p className="text-sm">{feedback.message}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Escalation Email Recipients */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Escalation Email Recipients
              </label>
              <p className="text-xs text-neutral-400 mb-3">
                Comma-separated email addresses. These people will receive an email whenever a ticket is escalated.
                The default admin email always receives escalations in addition to these.
              </p>
              <textarea
                value={settings.escalationEmails}
                onChange={(e) => setSettings(prev => ({ ...prev, escalationEmails: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="officer1@uia.go.ug, officer2@uia.go.ug, dg@uia.go.ug"
              />
              {settings.escalationEmails && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {settings.escalationEmails.split(',').map((email, i) => {
                    const trimmed = email.trim();
                    if (!trimmed) return null;
                    const valid = trimmed.includes('@');
                    return (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${
                          valid
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {trimmed}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Default Assignee */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Default Escalation Officer
              </label>
              <p className="text-xs text-neutral-400 mb-3">
                When a ticket is escalated and has no assignee, this person will be automatically assigned.
              </p>
              <input
                type="text"
                value={settings.defaultAssignee}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultAssignee: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g. Senior Investment Officer"
              />
            </div>

            {/* Custom Escalation Message */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Escalation Notification Message
              </label>
              <p className="text-xs text-neutral-400 mb-3">
                Custom message included in escalation email notifications. This appears above the review button.
              </p>
              <textarea
                value={settings.escalationMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, escalationMessage: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="A ticket has been escalated and requires immediate attention."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Escalation Settings'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
