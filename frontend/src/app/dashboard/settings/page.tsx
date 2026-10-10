'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { apiFetch } from '@/lib/api-client';
import { PageHeader, FeedbackBanner, StatusBadge, inputClass } from '@/components/dashboard/ui';

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
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Admin access required.</p>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title="Escalation Settings" subtitle="Configure who gets notified when tickets are escalated" />

        {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Escalation Email Recipients */}
            <div className="p-6 border-t border-neutral-200 pt-5">
              <label className="block text-sm font-semibold text-black mb-2">
                Escalation Email Recipients
              </label>
              <p className="text-xs text-neutral-700 mb-3">
                Comma-separated email addresses. These people will receive an email whenever a ticket is escalated.
                The default admin email always receives escalations in addition to these.
              </p>
              <textarea
                value={settings.escalationEmails}
                onChange={(e) => setSettings(prev => ({ ...prev, escalationEmails: e.target.value }))}
                rows={3}
                className={inputClass}
                placeholder="officer1@uia.go.ug, officer2@uia.go.ug, dg@uia.go.ug"
              />
              {settings.escalationEmails && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {settings.escalationEmails.split(',').map((email, i) => {
                    const trimmed = email.trim();
                    if (!trimmed) return null;
                    const valid = trimmed.includes('@');
                    return (
                      <StatusBadge
                        key={i}
                        tone={valid ? 'yellow' : 'red'}
                        className={valid ? 'border border-yellow-400' : 'border border-red-300'}
                      >
                        {trimmed}
                      </StatusBadge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Default Assignee */}
            <div className="p-6 border-t border-neutral-200 pt-5">
              <label htmlFor="default-assignee" className="block text-sm font-semibold text-black mb-2">
                Default Escalation Officer
              </label>
              <p id="default-assignee-help" className="text-xs text-neutral-700 mb-3">
                When a ticket is escalated and has no assignee, this staff member is assigned automatically.
                Enter the email of an active staff account; leave blank for no default.
              </p>
              <input
                id="default-assignee"
                type="email"
                aria-describedby="default-assignee-help"
                value={settings.defaultAssignee}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultAssignee: e.target.value }))}
                className={inputClass}
                placeholder="e.g. duty.officer@uia.go.ug"
              />
            </div>

            {/* Custom Escalation Message */}
            <div className="p-6 border-t border-neutral-200 pt-5">
              <label className="block text-sm font-semibold text-black mb-2">
                Escalation Notification Message
              </label>
              <p className="text-xs text-neutral-700 mb-3">
                Custom message included in escalation email notifications. This appears above the review button.
              </p>
              <textarea
                value={settings.escalationMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, escalationMessage: e.target.value }))}
                rows={3}
                className={inputClass}
                placeholder="A ticket has been escalated and requires immediate attention."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="gov-btn gov-btn--gold"
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
