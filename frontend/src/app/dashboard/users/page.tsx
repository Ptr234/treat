'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import { isAdminLevel } from '@/lib/roles';
import { PageHeader, FeedbackBanner, FormField, StatusBadge, inputClass } from '@/components/dashboard/ui';

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
  const isAdmin = isAdminLevel(user?.role);
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

  if (!isAuthenticated || !isAdmin) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Admin access required.</p>
      </div>
    );
  }

  const needsAgencyCode = createForm.role === 'agency_officer';

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="User Management"
          subtitle="Create and manage admin officers"
          actions={
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="gov-btn gov-btn--gold gov-btn--sm"
            >
              <UserPlusIcon className="w-5 h-5" />
              Add User
            </button>
          }
        />

        {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

        {/* Create Form */}
        {showCreate && (
          <div className="p-6 mb-8 border-t border-neutral-200 pt-5">
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Full Name">
                <input type="text" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Officer name" />
              </FormField>
              <FormField label="Email">
                <input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="officer@uia.go.ug" />
              </FormField>
              <FormField label="Password (min 8 chars, 1 uppercase, 1 digit)">
                <input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} className={inputClass} placeholder="Secure password" />
              </FormField>
              <FormField label="Role">
                <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))} className={inputClass}>
                  <option value="admin">Admin — full access</option>
                  <option value="dg">Director General — full access</option>
                  <option value="agency_officer">Agency Officer — scoped to one agency</option>
                </select>
              </FormField>
              {needsAgencyCode && (
                <FormField label="Agency Code (required)">
                  <input
                    type="text"
                    value={createForm.agencyCode}
                    onChange={e => setCreateForm(p => ({ ...p, agencyCode: e.target.value.toUpperCase() }))}
                    className={inputClass}
                    placeholder="e.g. UIA, URSB, URA"
                  />
                  <p className="text-xs text-neutral-600 mt-1">The officer will only see tickets assigned to this agency.</p>
                </FormField>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-neutral-700 hover:text-red-600 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !createForm.name || !createForm.email || !createForm.password || (needsAgencyCode && !createForm.agencyCode.trim())}
                className="gov-btn gov-btn--gold gov-btn--sm">
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className={`bg-white rounded-md border p-4 flex items-center justify-between ${u.isActive ? 'border-neutral-200' : 'border-red-900/50 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    u.isActive ? 'bg-yellow-50 text-red-600' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {u.name}
                      <StatusBadge tone={u.role === 'admin' || u.role === 'dg' ? 'yellow' : 'blue'}>
                        {roleLabel(u.role)}{u.agencyCode ? ` · ${u.agencyCode}` : ''}
                      </StatusBadge>
                      {!u.isActive && <StatusBadge tone="red">Inactive</StatusBadge>}
                    </div>
                    <div className="text-sm text-neutral-600">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.id !== user?.id && (
                    <>
                      <button onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-md transition-colors ${u.isActive ? 'hover:bg-red-50 text-neutral-600 hover:text-red-700' : 'hover:bg-[#fffbea] text-neutral-600 hover:text-black'}`}>
                        {u.isActive ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDelete(u)} title="Delete"
                        className="p-2 rounded-md hover:bg-red-50 text-neutral-600 hover:text-red-700 transition-colors">
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
