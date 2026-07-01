'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';

interface Agency {
  _id: string;
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  services?: string[];
  slaResponseHours?: number;
}

const AGENCY_CODES = ['UIA', 'URSB', 'URA', 'DCIC', 'NEMA', 'KCCA', 'LANDS', 'UNBS', 'ERA', 'NSSF', 'CMA', 'UMEME', 'NWSC', 'UTB', 'UFZA', 'FUE', 'GIANTS_CLUB', 'MLHUD'];

export default function AgencyManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', code: 'UIA', description: '', contactEmail: '',
    contactPhone: '', website: '', services: '', slaResponseHours: 4,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agencies');
      const json = await res.json();
      if (json.success) setAgencies(json.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAgencies();
  }, [isAuthenticated, fetchAgencies]);

  const resetForm = () => {
    setForm({ name: '', code: 'UIA', description: '', contactEmail: '', contactPhone: '', website: '', services: '', slaResponseHours: 4 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (a: Agency) => {
    setForm({
      name: a.name, code: a.code, description: a.description || '',
      contactEmail: a.contactEmail || '', contactPhone: a.contactPhone || '',
      website: a.website || '', services: (a.services || []).join(', '),
      slaResponseHours: a.slaResponseHours || 4,
    });
    setEditingId(a._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    const url = editingId ? `/api/agencies/${editingId}` : '/api/agencies';
    const method = editingId ? 'PATCH' : 'POST';
    const services = form.services.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, services, slaResponseHours: Number(form.slaResponseHours) }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: editingId ? 'Agency updated.' : 'Agency created.' });
        resetForm();
        fetchAgencies();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to save agency.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error.' });
    }
    setSaving(false);
  };

  const handleDelete = async (a: Agency) => {
    if (!confirm(`Delete "${a.name}" (${a.code})? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/agencies/${a._id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: `"${a.name}" deleted.` });
        fetchAgencies();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to delete.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error.' });
    }
  };

  if (!isAuthenticated || !isAdminLevel(user?.role)) {
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" aria-label="Back to dashboard">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Agency Management</h1>
              <p className="text-sm text-neutral-400">Manage government agencies, contact details, and SLA hours</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
            <PlusIcon className="w-5 h-5" />
            Add Agency
          </button>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border text-sm ${
            feedback.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>{feedback.message}</div>
        )}

        {showForm && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Agency' : 'Add New Agency'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Agency Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Uganda Revenue Authority" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Code *</label>
                <select value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} className={inputClass}>
                  {AGENCY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} className={inputClass} placeholder="info@ura.go.ug" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Contact Phone</label>
                <input type="tel" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} className={inputClass} placeholder="+256..." />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Website</label>
                <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://ura.go.ug" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">SLA Response Hours</label>
                <input type="number" min={1} value={form.slaResponseHours} onChange={e => setForm(p => ({ ...p, slaResponseHours: parseInt(e.target.value) || 4 }))} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} rows={2} placeholder="Agency description..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1">Services (comma-separated)</label>
                <input type="text" value={form.services} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} className={inputClass} placeholder="Tax Registration, TIN Issuance, ..." />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.code}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Agency' : 'Add Agency'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg mb-2">No agencies configured</p>
            <p className="text-sm">Add your first agency to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agencies.map(a => (
              <div key={a._id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{a.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 shrink-0">{a.code}</span>
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {a.contactEmail || 'No email'}
                    {a.slaResponseHours && ` · SLA: ${a.slaResponseHours}h`}
                    {a.services && a.services.length > 0 && ` · ${a.services.length} services`}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => handleEdit(a)} title="Edit"
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(a)} title="Delete"
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
