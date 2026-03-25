import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function MyDeliveriesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: deliveries = [], isLoading } = useQuery({ queryKey: ['myDeliveries'], queryFn: () => deliveriesAPI.getByPerson(user!.id).then(r => r.data) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: any) => deliveriesAPI.updateStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['myDeliveries'] }) });

  const statusColor: Record<string, string> = { ASSIGNED: 'badge-yellow', PICKED_UP: 'badge-blue', IN_TRANSIT: 'badge-purple', DELIVERED: 'badge-green', FAILED: 'badge-red' };
  const nextStatus: Record<string, string> = { ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'DELIVERED' };
  const active = deliveries.filter((d: any) => d.status !== 'DELIVERED' && d.status !== 'FAILED');

  return (
    <div className="page active">
      <h1 className="text-2xl font-bold mb-6 text-primary">My Deliveries</h1>
      {isLoading ? <p className="text-secondary">Loading...</p> : active.length === 0 ? <div className="card"><p className="text-secondary">No active deliveries</p></div> : (
        <div className="space-y-3">
          {active.map((d: any) => (
            <div key={d.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-cyan-500" /><span className="font-semibold text-primary">Order #{d.orderNumber}</span><span className={statusColor[d.status]}>{d.status.replace('_', ' ')}</span></div>
                  <p className="text-sm text-secondary mt-1">{d.retailerName}</p>
                  {d.shippingAddress && <p className="text-xs text-muted mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.shippingAddress}</p>}
                </div>
                {nextStatus[d.status] && (
                  <button onClick={() => statusMut.mutate({ id: d.id, status: nextStatus[d.status] })} className="btn-primary flex items-center gap-1.5">
                    {nextStatus[d.status] === 'DELIVERED' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    Mark as {nextStatus[d.status].replace('_', ' ')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
