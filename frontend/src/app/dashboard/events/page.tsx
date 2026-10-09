'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { PageHeader, FeedbackBanner, FormField, StatusBadge, inputClass } from '@/components/dashboard/ui';

interface SanityEvent {
  _id: string;
  title: string;
  slug?: { current: string };
  date: string;
  endDate?: string;
  category: string;
  description?: string;
  location?: string;
  registrationUrl?: string;
  isPublished: boolean;
}

const EVENT_CATEGORIES = ['UIA Forum', 'Government Mission', 'Sector Symposium', 'EAC Summit', 'Global Event', 'Webinar'];

export default function EventManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState<SanityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', date: '', endDate: '', category: 'UIA Forum',
    description: '', location: '', registrationUrl: '', isPublished: false,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const json = await res.json();
      if (json.success) setEvents(json.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated, fetchEvents]);

  const resetForm = () => {
    setForm({ title: '', date: '', endDate: '', category: 'UIA Forum', description: '', location: '', registrationUrl: '', isPublished: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ev: SanityEvent) => {
    setForm({
      title: ev.title,
      date: ev.date ? ev.date.slice(0, 16) : '',
      endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
      category: ev.category,
      description: ev.description || '',
      location: ev.location || '',
      registrationUrl: ev.registrationUrl || '',
      isPublished: ev.isPublished,
    });
    setEditingId(ev._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    const url = editingId ? `/api/events/${editingId}` : '/api/events';
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: editingId ? 'Event updated.' : 'Event created.' });
        resetForm();
        fetchEvents();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to save event.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error.' });
    }
    setSaving(false);
  };

  const handleDelete = async (ev: SanityEvent) => {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/events/${ev._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: `"${ev.title}" deleted.` });
        fetchEvents();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to delete event.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error.' });
    }
  };

  const handleTogglePublish = async (ev: SanityEvent) => {
    try {
      const res = await fetch(`/api/events/${ev._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !ev.isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        fetchEvents();
        setFeedback({ type: 'success', message: `"${ev.title}" ${ev.isPublished ? 'unpublished' : 'published'}.` });
      }
    } catch { /* ignore */ }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Event Management"
          subtitle="Create, edit, and publish events (stored in Sanity CMS)"
          actions={
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="gov-btn gov-btn--gold gov-btn--sm"
            >
              <PlusIcon className="w-5 h-5" />
              New Event
            </button>
          }
        />

        {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

        {/* Form */}
        {showForm && (
          <div className="p-6 mb-8 border-t border-neutral-200 pt-5">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Title" required wide>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Event title" />
              </FormField>
              <FormField label="Start Date" required>
                <input type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputClass} />
              </FormField>
              <FormField label="End Date">
                <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inputClass} />
              </FormField>
              <FormField label="Category" required>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                  {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Location">
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Kampala, Uganda" />
              </FormField>
              <FormField label="Description" wide>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} rows={3} placeholder="Event description..." />
              </FormField>
              <FormField label="Registration URL">
                <input type="url" value={form.registrationUrl} onChange={e => setForm(p => ({ ...p, registrationUrl: e.target.value }))} className={inputClass} placeholder="https://..." />
              </FormField>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-200 bg-neutral-100 text-[#8a7200]" />
                <label htmlFor="isPublished" className="text-sm">Publish immediately</label>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-neutral-700 hover:text-red-600 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.date || !form.category}
                className="gov-btn gov-btn--gold gov-btn--sm">
                {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-lg mb-2">No events yet</p>
            <p className="text-sm">Create your first event to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev._id} className={`bg-white rounded-md border p-4 flex items-center justify-between ${
                ev.isPublished ? 'border-neutral-200' : 'border-neutral-200 opacity-60'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{ev.title}</span>
                    <StatusBadge tone="yellow" className="shrink-0">{ev.category}</StatusBadge>
                    {!ev.isPublished && <StatusBadge tone="neutral" className="shrink-0">Draft</StatusBadge>}
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    {new Date(ev.date).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    {ev.location && ` · ${ev.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => handleTogglePublish(ev)} title={ev.isPublished ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600 transition-colors">
                    {ev.isPublished ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleEdit(ev)} title="Edit"
                    className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(ev)} title="Delete"
                    className="p-2 rounded-md hover:bg-red-50 text-neutral-600 hover:text-red-700 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
