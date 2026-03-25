import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['myOrders'], queryFn: () => ordersAPI.getByRetailer(user!.id).then(r => r.data) });
  const statusColor: Record<string, string> = { PENDING: 'badge-yellow', APPROVED: 'badge-blue', PROCESSING: 'badge-purple', SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red' };
  const paymentColor: Record<string, string> = { PENDING: 'badge-yellow', PAID: 'badge-green', FAILED: 'badge-red', REFUNDED: 'badge-blue' };

  return (
    <div className="page active">
      <h1 className="text-2xl font-bold mb-6 text-primary">My Orders</h1>
      <div className="card">
        {isLoading ? <p className="text-secondary">Loading...</p> : orders.length === 0 ? <p className="text-secondary">No orders yet. <a href="/catalog" className="text-cyan-600 dark:text-cyan-400 hover:underline">Browse catalog</a></p> : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap"><code className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-primary">{o.orderNumber}</code><span className={statusColor[o.status]}>{o.status}</span>{o.paymentStatus && <span className={paymentColor[o.paymentStatus] || 'badge'}>{o.paymentStatus}</span>}</div>
                    <p className="text-xs text-muted mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
                    {o.items?.length > 0 && <p className="text-sm text-secondary mt-1">{o.items.map((i: any) => `${i.medicineName} x${i.quantity}`).join(', ')}</p>}
                  </div>
                  <p className="text-lg font-bold text-primary">₹{o.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
