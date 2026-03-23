'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

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

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" aria-label="Back to dashboard">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Event Management</h1>
              <p className="text-sm text-neutral-400">Create, edit, and publish events (stored in Sanity CMS)</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Event
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border text-sm ${
            feedback.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Event title" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Start Date *</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">End Date</label>
                <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                  {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Kampala, Uganda" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} rows={3} placeholder="Event description..." />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Registration URL</label>
                <input type="url" value={form.registrationUrl} onChange={e => setForm(p => ({ ...p, registrationUrl: e.target.value }))} className={inputClass} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-yellow-500 focus:ring-yellow-500" />
                <label htmlFor="isPublished" className="text-sm">Publish immediately</label>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.date || !form.category}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg mb-2">No events yet</p>
            <p className="text-sm">Create your first event to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev._id} className={`bg-neutral-900 rounded-xl border p-4 flex items-center justify-between ${
                ev.isPublished ? 'border-neutral-800' : 'border-neutral-800 opacity-60'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{ev.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 shrink-0">{ev.category}</span>
                    {!ev.isPublished && <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-400 shrink-0">Draft</span>}
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {new Date(ev.date).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    {ev.location && ` · ${ev.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => handleTogglePublish(ev)} title={ev.isPublished ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-yellow-400 transition-colors">
                    {ev.isPublished ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleEdit(ev)} title="Edit"
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(ev)} title="Delete"
                    className="p-2 rounded-lg hover:bg-red-900/30 text-neutral-500 hover:text-red-400 transition-colors">
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
