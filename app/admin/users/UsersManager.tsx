'use client';

import { useState, FormEvent } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, SelectField } from '@/components/admin/FormField';
import { useToast } from '@/components/admin/Toast';
import { formatDate } from '@/lib/utils';

type Role = 'OWNER' | 'EDITOR' | 'SUPPORT';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  active: boolean;
  lastSeen: string | null;
  createdAt: string;
}

interface Props {
  currentUserId: string;
  initial: User[];
}

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'SUPPORT', label: 'Support' },
];

export function UsersManager({ currentUserId, initial }: Props) {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>(initial);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ email: '', name: '', password: '', role: 'EDITOR' as Role });

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: draft.email,
          name: draft.name || null,
          password: draft.password,
          role: draft.role,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setUsers((s) => [
        ...s,
        { ...j.user, lastSeen: null, createdAt: j.user.createdAt ?? new Date().toISOString() },
      ]);
      setDraft({ email: '', name: '', password: '', role: 'EDITOR' });
      setCreating(false);
      toast.push('success', 'User created');
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function update(id: string, patch: Partial<User>) {
    setUsers((s) => s.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  async function save(u: User, extra: { password?: string } = {}) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: u.name,
          role: u.role,
          active: u.active,
          ...(extra.password ? { password: extra.password } : {}),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed');
      }
      toast.push('success', 'Saved');
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this user? They will lose access immediately.')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed');
      }
      setUsers((s) => s.filter((u) => u.id !== id));
      toast.push('success', 'Deleted');
    } catch (err) {
      toast.push('error', (err as Error).message);
    }
  }

  async function resetPassword(u: User) {
    const pw = prompt(`Set a new password for ${u.email} (min. 8 characters):`);
    if (!pw || pw.length < 8) {
      if (pw !== null) toast.push('error', 'Password must be at least 8 characters');
      return;
    }
    await save(u, { password: pw });
    toast.push('success', 'Password reset');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreating((v) => !v)}>
          <Plus size={14} /> {creating ? 'Cancel' : 'Add user'}
        </Button>
      </div>

      {creating && (
        <form onSubmit={create} className="bg-cream border border-warm-grey/40 rounded-md p-6 space-y-4">
          <h2 className="font-belleza text-xl text-umber">New user</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField type="email" label="Email" name="email" required value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <TextField label="Name" name="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <TextField type="password" label="Password" name="password" required value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} hint="At least 8 characters." />
            <SelectField label="Role" name="role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })} options={ROLE_OPTIONS} />
          </div>
          <Button type="submit" disabled={busy}>
            <Save size={14} /> Create user
          </Button>
        </form>
      )}

      <div className="bg-cream border border-warm-grey/40 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-orange border-b border-warm-grey/30">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-poppins uppercase tracking-tracked text-umber/60">User</th>
                <th className="text-left px-4 py-3 text-[10px] font-poppins uppercase tracking-tracked text-umber/60">Role</th>
                <th className="text-left px-4 py-3 text-[10px] font-poppins uppercase tracking-tracked text-umber/60">Active</th>
                <th className="text-left px-4 py-3 text-[10px] font-poppins uppercase tracking-tracked text-umber/60 hidden md:table-cell">Created</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-grey/20">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <input
                        value={u.name ?? ''}
                        onChange={(e) => update(u.id, { name: e.target.value })}
                        placeholder="Name"
                        className="bg-transparent border-b border-transparent hover:border-warm-grey/30 focus:border-primary focus:outline-none px-1 text-sm"
                      />
                      <p className="text-xs text-umber/60">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <select
                      value={u.role}
                      disabled={u.id === currentUserId}
                      onChange={(e) => update(u.id, { role: e.target.value as Role })}
                      className="bg-bg-orange border border-warm-grey/30 rounded px-2 py-1 text-xs disabled:opacity-50"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={u.active}
                        disabled={u.id === currentUserId}
                        onChange={(e) => update(u.id, { active: e.target.checked })}
                      />
                      <span className="text-xs">{u.active ? 'Active' : 'Inactive'}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 align-middle hidden md:table-cell text-xs text-umber/60">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button type="button" size="sm" onClick={() => save(u)} disabled={busy}>
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => resetPassword(u)} disabled={busy}>
                        Reset password
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => remove(u.id)}
                        disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? 'Cannot delete yourself' : ''}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
