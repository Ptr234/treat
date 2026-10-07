'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { PageHeader, FeedbackBanner, FormField, StatusBadge, inputClass } from '@/components/dashboard/ui';

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
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Admin access required.</p>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Agency Management"
          subtitle="Manage government agencies, contact details, and SLA hours"
          actions={
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Agency
            </button>
          }
        />

        {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

        {showForm && (
          <div className="p-6 mb-8 border-t border-neutral-200 pt-5">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Agency' : 'Add New Agency'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Agency Name" required>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Uganda Revenue Authority" />
              </FormField>
              <FormField label="Code" required>
                <select value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} className={inputClass}>
                  {AGENCY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Contact Email">
                <input type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} className={inputClass} placeholder="info@ura.go.ug" />
              </FormField>
              <FormField label="Contact Phone">
                <input type="tel" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} className={inputClass} placeholder="+256..." />
              </FormField>
              <FormField label="Website">
                <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://ura.go.ug" />
              </FormField>
              <FormField label="SLA Response Hours">
                <input type="number" min={1} value={form.slaResponseHours} onChange={e => setForm(p => ({ ...p, slaResponseHours: parseInt(e.target.value) || 4 }))} className={inputClass} />
              </FormField>
              <FormField label="Description" wide>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} rows={2} placeholder="Agency description..." />
              </FormField>
              <FormField label="Services (comma-separated)" wide>
                <input type="text" value={form.services} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} className={inputClass} placeholder="Tax Registration, TIN Issuance, ..." />
              </FormField>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-neutral-700 hover:text-red-600 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.code}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Agency' : 'Add Agency'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-lg mb-2">No agencies configured</p>
            <p className="text-sm">Add your first agency to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agencies.map(a => (
              <div key={a._id} className="p-4 flex items-center justify-between border-t border-neutral-200 pt-5">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{a.name}</span>
                    <StatusBadge tone="yellow" className="shrink-0">{a.code}</StatusBadge>
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    {a.contactEmail || 'No email'}
                    {a.slaResponseHours && ` · SLA: ${a.slaResponseHours}h`}
                    {a.services && a.services.length > 0 && ` · ${a.services.length} services`}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => handleEdit(a)} title="Edit"
                    className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(a)} title="Delete"
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
