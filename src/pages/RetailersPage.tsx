import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retailersAPI, usersAPI } from '../api';

export default function RetailersPage() {
  const qc = useQueryClient();
  const { data: retailers = [], isLoading } = useQuery({
    queryKey: ['retailers', 'admin'],
    queryFn: () => retailersAPI.getAllAdmin().then(r => r.data),
  });

  const toggleActiveMut = useMutation({
    mutationFn: (id: number) => retailersAPI.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retailers', 'admin'] }),
  });
  const toggleVerifiedMut = useMutation({
    mutationFn: (id: number) => retailersAPI.toggleVerified(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retailers', 'admin'] }),
  });
  const toggleUserMut = useMutation({
    mutationFn: (userId: number) => usersAPI.toggleStatus(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retailers', 'admin'] }),
  });

  const list = (retailers as any[]) || [];

  return (
    <div className="page active">
      <div className="table-card mt14">
        {isLoading ? (
          <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : list.length === 0 ? (
          <div className="p-6" style={{ color: 'var(--text-muted)' }}>No retailers yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Owner</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r: any) => (
                  <tr key={r.id}>
                    <td className="primary">{r.storeName || '—'}</td>
                    <td>{r.ownerName || '—'}</td>
                    <td className="mono">{r.email || '—'}</td>
                    <td className="mono">{r.phone || '—'}</td>
                    <td>{[r.address, r.city].filter(Boolean).join(', ') || '—'}</td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`badge ${r.active ? 'badge-active' : 'badge-inactive'}`}>
                          {r.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className={`badge ${r.verified ? 'badge-active' : 'badge-pending'}`}>
                          {r.verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                        <span className={`badge ${r.userEnabled ? 'badge-active' : 'badge-inactive'}`}>
                          {r.userEnabled ? 'USER ENABLED' : 'USER DISABLED'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="act-btn"
                          disabled={toggleActiveMut.isPending}
                          onClick={() => toggleActiveMut.mutate(r.id)}
                        >
                          {r.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          className="act-btn"
                          disabled={toggleVerifiedMut.isPending}
                          onClick={() => toggleVerifiedMut.mutate(r.id)}
                        >
                          {r.verified ? 'Unverify' : 'Verify'}
                        </button>
                        {typeof r.userId === 'number' && (
                          <button
                            type="button"
                            className="act-btn del"
                            disabled={toggleUserMut.isPending}
                            onClick={() => toggleUserMut.mutate(r.userId)}
                          >
                            Toggle user
                          </button>
                        )}
                      </div>
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
