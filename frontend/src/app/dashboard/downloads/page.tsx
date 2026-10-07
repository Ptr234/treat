'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { PageHeader, FeedbackBanner, FormField, StatusBadge, inputClass } from '@/components/dashboard/ui';

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
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Admin access required.</p>
      </div>
    );
  }

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Downloads Management"
          subtitle="Manage downloadable forms, guides, and resources"
          actions={
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Resource
            </button>
          }
        />

        {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

        {showForm && (
          <div className="p-6 mb-8 border-t border-neutral-200 pt-5">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Title" required wide>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Business Registration Form" />
              </FormField>
              <FormField label="Category" required>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </FormField>
              <FormField label="File Type" required>
                <select value={form.fileType} onChange={e => setForm(p => ({ ...p, fileType: e.target.value }))} className={inputClass}>
                  {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Description" wide>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} rows={2} placeholder="Brief description of this resource..." />
              </FormField>
              <FormField label="Sort Order">
                <input type="number" min={0} value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className={inputClass} />
              </FormField>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="publishDownload" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-200 bg-neutral-100 text-yellow-500 focus-visible:ring-red-600" />
                <label htmlFor="publishDownload" className="text-sm">Published</label>
              </div>
            </div>
            <p className="text-xs text-neutral-600 mb-4">Note: Upload files directly in Sanity Studio at /studio for now. This form manages metadata.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-neutral-700 hover:text-red-600 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.category}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Add Resource'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-lg mb-2">No resources yet</p>
            <p className="text-sm">Add your first downloadable resource.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map(r => (
              <div key={r._id} className={`bg-white rounded-md border p-4 flex items-center justify-between ${
                r.isPublished ? 'border-neutral-200' : 'border-neutral-200 opacity-60'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{r.title}</span>
                    <StatusBadge tone="blue" className="shrink-0">{r.fileType}</StatusBadge>
                    <StatusBadge tone="neutral" className="shrink-0">{getCategoryLabel(r.category)}</StatusBadge>
                    {!r.isPublished && <StatusBadge tone="neutral" className="shrink-0">Draft</StatusBadge>}
                  </div>
                  {r.description && <div className="text-sm text-neutral-600 mt-1 truncate">{r.description}</div>}
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => handleTogglePublish(r)} title={r.isPublished ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600 transition-colors">
                    {r.isPublished ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleEdit(r)} title="Edit"
                    className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(r)} title="Delete"
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
