'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, UserPlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  agencyCode?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  dg: 'Director General',
  agency_officer: 'Agency Officer',
  officer: 'Agency Officer', // legacy alias
};

const roleLabel = (role: string) => ROLE_LABELS[role] ?? role;

export default function UserManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdminLevel = ['admin', 'dg'].includes(user?.role ?? '');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'admin', agencyCode: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminUser[]>('/api/admin/users');
    if (res.success && res.data) setUsers(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated, fetchUsers]);

  const handleCreate = async () => {
    setSaving(true);
    setFeedback(null);
    const res = await apiFetch<AdminUser>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(createForm),
    });
    if (res.success) {
      setFeedback({ type: 'success', message: `User ${createForm.email} created successfully.` });
      setCreateForm({ name: '', email: '', password: '', role: 'admin', agencyCode: '' });
      setShowCreate(false);
      fetchUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to create user.' });
    }
    setSaving(false);
  };

  const handleToggleActive = async (u: AdminUser) => {
    const res = await apiFetch('/api/admin/users/' + u.id, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    if (res.success) {
      fetchUsers();
      setFeedback({ type: 'success', message: `${u.name} ${u.isActive ? 'deactivated' : 'activated'}.` });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update user.' });
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    const res = await apiFetch('/api/admin/users/' + u.id, { method: 'DELETE' });
    if (res.success) {
      fetchUsers();
      setFeedback({ type: 'success', message: `${u.name} deleted.` });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete user.' });
    }
  };

  if (!isAuthenticated || !isAdminLevel) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  const needsAgencyCode = createForm.role === 'agency_officer';

  const inputClass = "w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" aria-label="Back to dashboard">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-sm text-neutral-400">Create and manage admin officers</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <UserPlusIcon className="w-5 h-5" />
            Add User
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

        {/* Create Form */}
        {showCreate && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Full Name</label>
                <input type="text" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Officer name" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                <input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="officer@uia.go.ug" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Password (min 8 chars, 1 uppercase, 1 digit)</label>
                <input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} className={inputClass} placeholder="Secure password" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Role</label>
                <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))} className={inputClass}>
                  <option value="admin">Admin — full access</option>
                  <option value="dg">Director General — full access</option>
                  <option value="agency_officer">Agency Officer — scoped to one agency</option>
                </select>
              </div>
              {needsAgencyCode && (
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Agency Code (required)</label>
                  <input
                    type="text"
                    value={createForm.agencyCode}
                    onChange={e => setCreateForm(p => ({ ...p, agencyCode: e.target.value.toUpperCase() }))}
                    className={inputClass}
                    placeholder="e.g. UIA, URSB, URA"
                  />
                  <p className="text-xs text-neutral-500 mt-1">The officer will only see tickets assigned to this agency.</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !createForm.name || !createForm.email || !createForm.password || (needsAgencyCode && !createForm.agencyCode.trim())}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className={`bg-neutral-900 rounded-xl border p-4 flex items-center justify-between ${u.isActive ? 'border-neutral-800' : 'border-red-900/50 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    u.isActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-neutral-700 text-neutral-500'
                  }`}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {u.name}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === 'admin' || u.role === 'dg' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {roleLabel(u.role)}{u.agencyCode ? ` · ${u.agencyCode}` : ''}
                      </span>
                      {!u.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Inactive</span>}
                    </div>
                    <div className="text-sm text-neutral-500">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.id !== user?.id && (
                    <>
                      <button onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-lg transition-colors ${u.isActive ? 'hover:bg-red-900/30 text-neutral-500 hover:text-red-400' : 'hover:bg-green-900/30 text-neutral-500 hover:text-green-400'}`}>
                        {u.isActive ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDelete(u)} title="Delete"
                        className="p-2 rounded-lg hover:bg-red-900/30 text-neutral-500 hover:text-red-400 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {u.id === user?.id && (
                    <span className="text-xs text-neutral-600 px-2">You</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
