import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, deliveriesAPI, usersAPI } from '../api';
import { Truck } from 'lucide-react';

export default function OrdersPage() {
  const qc = useQueryClient();
  const [assignOrder, setAssignOrder] = useState<any>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | ''>('');

  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => ordersAPI.getAll().then(r => r.data) });
  const { data: deliveryUsers = [] } = useQuery({
    queryKey: ['users', 'DELIVERY'],
    queryFn: () => usersAPI.getByRole('DELIVERY').then(r => r.data),
    enabled: !!assignOrder,
  });

  const statusMut = useMutation({ mutationFn: ({ id, status }: any) => ordersAPI.updateStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }) });
  const createDeliveryMut = useMutation({
    mutationFn: (payload: any) => deliveriesAPI.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      if (assignOrder) statusMut.mutate({ id: assignOrder.id, status: 'SHIPPED' });
      setAssignOrder(null);
      setSelectedPersonId('');
    },
  });

  const statusBadge: Record<string, string> = { PENDING: 'badge-pending', APPROVED: 'badge-approved', PROCESSING: 'badge-approved', SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-inactive' };
  const nextStatus: Record<string, string[]> = { PENDING: ['APPROVED', 'CANCELLED'], APPROVED: ['PROCESSING', 'CANCELLED'], PROCESSING: ['SHIPPED'], SHIPPED: ['DELIVERED'] };

  const openAssign = (order: any) => setAssignOrder(order);
  const confirmAssign = () => {
    if (!assignOrder || !selectedPersonId) return;
    const person = (deliveryUsers as any[]).find((u: any) => u.id === selectedPersonId);
    const name = person ? [person.firstName, person.lastName].filter(Boolean).join(' ').trim() || person.email : '';
    createDeliveryMut.mutate({
      orderId: assignOrder.id,
      orderNumber: assignOrder.orderNumber,
      retailerName: assignOrder.retailerName,
      shippingAddress: assignOrder.shippingAddress,
      status: 'ASSIGNED',
      deliveryPersonId: Number(selectedPersonId),
      deliveryPersonName: name || `Delivery #${selectedPersonId}`,
    });
  };

  return (
    <div className="page active">
      <div className="stats-grid-4 mt14" style={{ marginBottom: 0 }}>
        <div className="stat-card"><div className="stat-ico ico-purple">🛒</div><div><div className="stat-val">{orders?.length ?? 0}</div><div className="stat-lbl">Total Orders</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-amber">⏳</div><div><div className="stat-val">{orders?.filter((o: any) => o.status === 'PENDING').length ?? 0}</div><div className="stat-lbl">Pending</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-blue">🚚</div><div><div className="stat-val">{orders?.filter((o: any) => o.status === 'SHIPPED').length ?? 0}</div><div className="stat-lbl">Shipped</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-green">✅</div><div><div className="stat-val">{orders?.filter((o: any) => o.status === 'DELIVERED').length ?? 0}</div><div className="stat-lbl">Delivered</div></div></div>
      </div>
      <div className="table-card mt20">
        {isLoading ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading...</div> : orders.length === 0 ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>No orders yet</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th>Order ID</th><th>Retailer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id}>
                    <td className="primary mono">{o.orderNumber}</td>
                    <td>{o.retailerName || `Retailer #${o.retailerId}`}</td>
                    <td>{o.items?.length ?? 0} items</td>
                    <td>₹{o.totalAmount?.toFixed(2)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge ${statusBadge[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        {(nextStatus[o.status] || []).map((ns: string) => (
                          <button key={ns} type="button" onClick={() => ns === 'SHIPPED' ? openAssign(o) : statusMut.mutate({ id: o.id, status: ns })} className={ns === 'CANCELLED' ? 'act-btn del' : 'act-btn'}>
                            {ns === 'SHIPPED' && <Truck className="w-3 h-3 inline" />} {ns === 'SHIPPED' ? 'Assign delivery' : ns}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {assignOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAssignOrder(null)}>
          <div className="panel max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="panel-hdr">
              <span className="panel-title">Assign delivery person</span>
            </div>
            <div className="panel-body">
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Order {assignOrder.orderNumber}</p>
              <label className="label">Delivery person</label>
              <select className="input mb-4" value={selectedPersonId} onChange={e => setSelectedPersonId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select person</option>
                {(deliveryUsers as any[]).map((u: any) => (
                  <option key={u.id} value={u.id}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" className="tb-btn primary" disabled={!selectedPersonId || createDeliveryMut.isPending} onClick={confirmAssign}>
                  {createDeliveryMut.isPending ? 'Assigning...' : 'Assign & ship'}
                </button>
                <button type="button" className="tb-btn" onClick={() => { setAssignOrder(null); setSelectedPersonId(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
