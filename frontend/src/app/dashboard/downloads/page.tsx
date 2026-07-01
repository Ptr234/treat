'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';

interface Download {
  _id: string;
  title: string;
  description?: string;
  category: string;
  fileType: string;
  sortOrder?: number;
  isPublished: boolean;
  file?: { asset: { url: string; size?: number } };
}

const CATEGORIES = [
  { value: 'business_registration', label: 'Business Registration Forms' },
  { value: 'tax_registration', label: 'Tax Registration' },
  { value: 'investment_licenses', label: 'Investment Licenses' },
  { value: 'guides_resources', label: 'Guides & Resources' },
];
const FILE_TYPES = ['PDF', 'DOCX', 'XLSX', 'ZIP', 'CSV'];

export default function DownloadsManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const [resources, setResources] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'business_registration',
    fileType: 'PDF', sortOrder: 0, isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/downloads');
      const json = await res.json();
      if (json.success) setResources(json.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchResources();
  }, [isAuthenticated, fetchResources]);

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'business_registration', fileType: 'PDF', sortOrder: 0, isPublished: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r: Download) => {
    setForm({
      title: r.title, description: r.description || '', category: r.category,
      fileType: r.fileType, sortOrder: r.sortOrder || 0, isPublished: r.isPublished,
    });
    setEditingId(r._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    const url = editingId ? `/api/downloads/${editingId}` : '/api/downloads';
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: editingId ? 'Resource updated.' : 'Resource created.' });
        resetForm();
        fetchResources();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to save.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error.' });
    }
    setSaving(false);
  };

  const handleDelete = async (r: Download) => {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/downloads/${r._id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: `"${r.title}" deleted.` });
        fetchResources();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to delete.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error.' });
    }
  };

  const handleTogglePublish = async (r: Download) => {
    try {
      const res = await fetch(`/api/downloads/${r._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !r.isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        fetchResources();
        setFeedback({ type: 'success', message: `"${r.title}" ${r.isPublished ? 'unpublished' : 'published'}.` });
      }
    } catch { /* ignore */ }
  };

  if (!isAuthenticated || !isAdminLevel(user?.role)) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent";
  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" aria-label="Back to dashboard">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Downloads Management</h1>
              <p className="text-sm text-neutral-400">Manage downloadable forms, guides, and resources</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
            <PlusIcon className="w-5 h-5" />
            Add Resource
          </button>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border text-sm ${
            feedback.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>{feedback.message}</div>
        )}

        {showForm && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Business Registration Form" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">File Type *</label>
                <select value={form.fileType} onChange={e => setForm(p => ({ ...p, fileType: e.target.value }))} className={inputClass}>
                  {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} rows={2} placeholder="Brief description of this resource..." />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Sort Order</label>
                <input type="number" min={0} value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className={inputClass} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="publishDownload" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-yellow-500 focus:ring-yellow-500" />
                <label htmlFor="publishDownload" className="text-sm">Published</label>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Note: Upload files directly in Sanity Studio at /studio for now. This form manages metadata.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.category}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Add Resource'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg mb-2">No resources yet</p>
            <p className="text-sm">Add your first downloadable resource.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map(r => (
              <div key={r._id} className={`bg-neutral-900 rounded-xl border p-4 flex items-center justify-between ${
                r.isPublished ? 'border-neutral-800' : 'border-neutral-800 opacity-60'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{r.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 shrink-0">{r.fileType}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-300 shrink-0">{getCategoryLabel(r.category)}</span>
                    {!r.isPublished && <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-400 shrink-0">Draft</span>}
                  </div>
                  {r.description && <div className="text-sm text-neutral-500 mt-1 truncate">{r.description}</div>}
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => handleTogglePublish(r)} title={r.isPublished ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-yellow-400 transition-colors">
                    {r.isPublished ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleEdit(r)} title="Edit"
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(r)} title="Delete"
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
