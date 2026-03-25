import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { deliveriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

export default function DeliveryHistoryPage() {
  const { user } = useAuth();
  const { data: deliveries = [], isLoading } = useQuery({ queryKey: ['myDeliveries'], queryFn: () => deliveriesAPI.getByPerson(user!.id).then(r => r.data) });
  const completed = deliveries.filter((d: any) => d.status === 'DELIVERED' || d.status === 'FAILED');

  return (
    <div className="page active">
      <h1 className="text-2xl font-bold mb-6 text-primary">Delivery History</h1>
      <div className="card">
        {isLoading ? <p className="text-secondary">Loading...</p> : completed.length === 0 ? <p className="text-secondary">No completed deliveries</p> : (
          <div className="space-y-3">
            {completed.map((d: any) => (
              <div key={d.id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <div className="flex items-center gap-2">
                    {d.status === 'DELIVERED' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    <span className="font-semibold text-primary">Order #{d.orderNumber}</span>
                    <span className={d.status === 'DELIVERED' ? 'badge-green' : 'badge-red'}>{d.status}</span>
                  </div>
                  <p className="text-sm text-secondary mt-1">{d.retailerName}</p>
                </div>
                {d.deliveredAt && <p className="text-xs text-muted">{new Date(d.deliveredAt).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
