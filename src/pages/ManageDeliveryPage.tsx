import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../api';
import { Truck, UserCheck, UserX } from 'lucide-react';

export default function ManageDeliveryPage() {
  const qc = useQueryClient();
  const { data: deliveryUsers = [], isLoading } = useQuery({
    queryKey: ['users', 'DELIVERY'],
    queryFn: () => usersAPI.getByRole('DELIVERY').then((r) => r.data),
  });
  const toggleMut = useMutation({
    mutationFn: (id: number) => usersAPI.toggleStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div className="page active">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-white)' }}>
        Manage Delivery Personnel
      </h1>
      <div className="table-card">
        <div className="tbar">
          <span className="panel-title">Delivery accounts (created by Admin)</span>
        </div>
        {isLoading ? (
          <div className="p-6" style={{ color: 'var(--text-muted)' }}>
            Loading…
          </div>
        ) : deliveryUsers.length === 0 ? (
          <div className="p-6" style={{ color: 'var(--text-muted)' }}>
            No delivery personnel yet. Create one from Create Delivery.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryUsers.map((u: any) => (
                  <tr key={u.id}>
                    <td className="primary">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '—'}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {u.enabled ? (
                        <span className="badge badge-active">Active</span>
                      ) : (
                        <span className="badge badge-inactive">Disabled</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleMut.mutate(u.id)}
                        className={`act-btn flex items-center gap-1 ${u.enabled ? 'del' : ''}`}
                        title={u.enabled ? 'Disable' : 'Enable'}
                      >
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
