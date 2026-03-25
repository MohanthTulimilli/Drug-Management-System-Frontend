import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => ordersAPI.getByRetailer(user!.id).then((r) => r.data),
  });

  const paidOrders = orders.filter((o: any) => o.paymentStatus === 'PAID');
  const paymentColor: Record<string, string> = {
    PENDING: 'badge-yellow',
    PAID: 'badge-green',
    FAILED: 'badge-red',
    REFUNDED: 'badge-blue',
  };

  return (
    <div className="page active">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <CreditCard className="w-7 h-7" /> Payment History
      </h1>
      <div className="card">
        {isLoading ? (
          <p className="text-secondary">Loading...</p>
        ) : paidOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary">
              No successful payments yet. Complete a checkout to see payment history here.
            </p>
            <a href="/catalog" className="text-cyan-600 dark:text-cyan-400 hover:underline mt-2 inline-block">
              Browse catalog
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {paidOrders.map((o: any) => (
              <div
                key={o.id}
                className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-primary">
                        {o.orderNumber}
                      </code>
                      <span className={paymentColor[o.paymentStatus] || 'badge'}>{o.paymentStatus}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    {o.razorpayPaymentId && (
                      <p className="text-xs text-secondary mt-0.5 font-mono">
                        Payment ID: {o.razorpayPaymentId}
                      </p>
                    )}
                    {o.shopName && (
                      <p className="text-sm text-secondary mt-0.5">{o.shopName}</p>
                    )}
                  </div>
                </div>
                <p className="text-lg font-bold text-primary">₹{o.totalAmount?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-secondary mt-4">
        <a href="/my-orders" className="text-cyan-600 dark:text-cyan-400 hover:underline">
          View all orders →
        </a>
      </p>
    </div>
  );
}
