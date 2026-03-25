import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../api';
import { Plus, UserCheck, UserX, Search } from 'lucide-react';

export default function UsersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'ADMIN' });

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersAPI.getAll().then(r => r.data) });
  const createMut = useMutation({ mutationFn: (d: any) => usersAPI.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); resetForm(); } });
  const toggleMut = useMutation({ mutationFn: (id: number) => usersAPI.toggleStatus(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });

  const resetForm = () => setForm({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'ADMIN' });
  const filtered = users.filter((u: any) => u.username.toLowerCase().includes(search.toLowerCase()) || u.firstName?.toLowerCase().includes(search.toLowerCase()));

  const roleBadge: Record<string, string> = { SUPER_ADMIN: 'badge-purple', ADMIN: 'badge-blue', RETAILER: 'badge-green', DELIVERY: 'badge-yellow' };

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setShowForm(!showForm)} className="tb-btn primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add User</button>
      </div>

      {showForm && (
        <div className="panel mb-6">
          <div className="panel-hdr"><span className="panel-title">Create New User</span></div>
          <div className="panel-body">
          <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <input className="input" placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            <input className="input" placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="ADMIN">Admin</option><option value="RETAILER">Retailer</option><option value="DELIVERY">Delivery</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="tb-btn primary" disabled={createMut.isPending}>{createMut.isPending ? 'Creating...' : 'Create'}</button>
              <button type="button" className="tb-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="table-card mt14">
        <div className="tbar">
          <div className="tsearch">
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id}>
                    <td><div className="primary font-medium">{u.firstName} {u.lastName}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>@{u.username}</div></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-approved' : u.role === 'RETAILER' ? 'badge-delivered' : 'badge-shipped'}`}>{u.role?.replace('_', ' ')}</span></td>
                    <td>{u.enabled ? <span className="badge badge-active">Active</span> : <span className="badge badge-inactive">Disabled</span>}</td>
                    <td>
                      <button type="button" onClick={() => toggleMut.mutate(u.id)} className={`act-btn flex items-center gap-1 ${u.enabled ? 'del' : ''}`} title={u.enabled ? 'Disable' : 'Enable'}>
                        {u.enabled ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
