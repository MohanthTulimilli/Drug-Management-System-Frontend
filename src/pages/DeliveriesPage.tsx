import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesAPI } from '../api';
import { Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function DeliveriesPage() {
  const qc = useQueryClient();
  const { data: deliveries = [], isLoading } = useQuery({ queryKey: ['deliveries'], queryFn: () => deliveriesAPI.getAll().then(r => r.data) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: any) => deliveriesAPI.updateStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }) });

  const statusBadge: Record<string, string> = { ASSIGNED: 'badge-pending', PICKED_UP: 'badge-shipped', IN_TRANSIT: 'badge-shipped', DELIVERED: 'badge-delivered', FAILED: 'badge-inactive' };
  const nextStatus: Record<string, string> = { ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'DELIVERED' };

  const list = deliveries as any[];
  const total = list.length;
  const active = list.filter((d: any) => d.status !== 'DELIVERED' && d.status !== 'FAILED').length;
  const completed = list.filter((d: any) => d.status === 'DELIVERED').length;
  const failed = list.filter((d: any) => d.status === 'FAILED').length;

  const steps: { key: string; label: string; doneWhen: string[]; goingWhen: string }[] = [
    { key: '1', label: 'Packed', doneWhen: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'], goingWhen: '' },
    { key: '2', label: 'Shipped', doneWhen: ['IN_TRANSIT', 'DELIVERED'], goingWhen: 'PICKED_UP' },
    { key: '3', label: 'Done', doneWhen: ['DELIVERED'], goingWhen: 'IN_TRANSIT' },
  ];
  const getStepState = (d: any, step: typeof steps[0]) => {
    if (step.doneWhen.includes(d.status)) return 'done';
    if (d.status === step.goingWhen) return 'going';
    return 'pending';
  };

  return (
    <div className="page active">
      <div className="stats-grid-4 mt14" style={{ marginBottom: 0 }}>
        <div className="stat-card"><div className="stat-ico ico-teal">🚚</div><div><div className="stat-val">{total}</div><div className="stat-lbl">Total Deliveries</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-amber">⏳</div><div><div className="stat-val">{active}</div><div className="stat-lbl">Active</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-green">✅</div><div><div className="stat-val">{completed}</div><div className="stat-lbl">Completed</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-red">❌</div><div><div className="stat-val">{failed}</div><div className="stat-lbl">Failed</div></div></div>
      </div>
      <div className="table-card mt20">
        {isLoading ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading...</div> : list.length === 0 ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>No deliveries yet</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Delivery ID</th>
                  <th>Order</th>
                  <th>Retailer</th>
                  <th>Dispatched</th>
                  <th>Delivered</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d: any) => (
                  <tr key={d.id}>
                    <td className="primary mono">#DEL-{String(d.id).padStart(3, '0')}</td>
                    <td className="mono">#{d.orderNumber}</td>
                    <td>{d.retailerName || '—'}</td>
                    <td>{d.assignedAt ? new Date(d.assignedAt).toLocaleDateString() : '—'}</td>
                    <td>{d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${statusBadge[d.status] || 'badge-pending'}`}>{d.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="flex items-center gap-2 flex-wrap">
                        {steps.map((s, i) => {
                          const state = getStepState(d, s);
                          return (
                            <span key={s.key} className="flex items-center gap-1">
                              <span className={`dstep-dot ${state === 'done' ? '!bg-[var(--green)] !border-[var(--green)] text-white' : state === 'going' ? '!border-[#1ab8cc] text-[#1ab8cc]' : ''}`} style={{ width: 18, height: 18, fontSize: 10 }}>
                                {state === 'done' ? '✓' : state === 'going' ? '→' : '·'}
                              </span>
                              <span className="text-[10px]" style={{ color: state === 'pending' ? 'var(--text-muted)' : 'var(--text-dim)' }}>{s.label}</span>
                              {i < steps.length - 1 && <span className="text-[10px] mx-0.5" style={{ color: 'var(--text-muted)' }}>→</span>}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      {nextStatus[d.status] && (
                        <button type="button" onClick={() => statusMut.mutate({ id: d.id, status: nextStatus[d.status] })} className="tb-btn primary text-xs px-3 py-1.5 flex items-center gap-1">
                          {nextStatus[d.status] === 'DELIVERED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          Mark {nextStatus[d.status].replace('_', ' ')}
                        </button>
                      )}
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
