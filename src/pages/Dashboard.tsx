import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { usersAPI, inventoryAPI, ordersAPI, deliveriesAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DASHBOARD_STATS: Array<{ ico: string; emoji: string; label: string; key: string; to?: string }> = [
  { ico: 'ico-teal', emoji: '📦', label: 'Total Medicines', key: 'totalMedicines', to: '/medicines' },
  { ico: 'ico-blue', emoji: '🗃️', label: 'Total Stock', key: 'totalStock', to: '/inventory' },
  { ico: 'ico-red', emoji: '⚠️', label: 'Low Stock Items', key: 'lowStockCount', to: '/inventory' },
  { ico: 'ico-amber', emoji: '⏰', label: 'Expiring Soon', key: 'expiringSoonCount', to: '/inventory' },
  { ico: 'ico-purple', emoji: '🛒', label: 'Total Orders', key: 'orderTotal', to: '/orders' },
  { ico: 'ico-orange', emoji: '⏳', label: 'Pending Orders', key: 'orderPending', to: '/orders' },
  { ico: 'ico-cyan', emoji: '🚚', label: 'Active Deliveries', key: 'delInTransit', to: '/deliveries' },
  { ico: 'ico-green', emoji: '✅', label: 'Completed', key: 'delDelivered', to: '/deliveries' },
];

const PIPELINE_DATA = [
  { name: 'Pending', count: 0 },
  { name: 'Approved', count: 0 },
  { name: 'Shipped', count: 3 },
  { name: 'Delivered', count: 2 },
];

const ACTIVITY = [
  { type: 'g', text: 'Order #ORD-005 delivered to MedPlus Retail', time: '2 hours ago' },
  { type: 'b', text: 'Batch BATCH064 added — Itraconazole (88 units)', time: '5 hours ago' },
  { type: 'a', text: 'New retailer registered: HealthFirst Pharmacy', time: 'Yesterday, 4:30 PM' },
  { type: 'g', text: 'Bulk upload completed — 12 medicines updated', time: 'Yesterday, 11:00 AM' },
];

const STOCK_BY_CATEGORY = [
  { name: 'Antibiotics', units: 1240, pct: 82, prog: 'prog-teal' },
  { name: 'Antifungals', units: 860, pct: 57, prog: 'prog-green' },
  { name: 'Antivirals', units: 620, pct: 41, prog: 'prog-amber' },
  { name: 'Cardiovascular', units: 1870, pct: 95, prog: 'prog-teal' },
];

function StatCardSpec({
  ico,
  emoji,
  label,
  value,
  to,
}: {
  ico: string;
  emoji: string;
  label: string;
  value: string | number;
  to?: string;
}) {
  const inner = (
    <>
      <div className={`stat-ico ${ico}`}>{emoji}</div>
      <div>
        <div className="stat-val">{value ?? '—'}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="stat-card" style={{ textDecoration: 'none' }}>
        {inner}
      </Link>
    );
  }

  return <div className="stat-card">{inner}</div>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;

  const { data: userStats } = useQuery({ queryKey: ['userStats'], queryFn: () => usersAPI.stats().then(r => r.data), enabled: role === 'SUPER_ADMIN' || role === 'ADMIN' });
  const { data: invStats } = useQuery({ queryKey: ['invStats'], queryFn: () => inventoryAPI.dashboard().then(r => r.data), enabled: role === 'SUPER_ADMIN' || role === 'ADMIN' });
  const { data: orderStats } = useQuery({ queryKey: ['orderStats'], queryFn: () => ordersAPI.stats().then(r => r.data), enabled: role !== 'DELIVERY' });
  const { data: delStats } = useQuery({ queryKey: ['delStats'], queryFn: () => deliveriesAPI.stats().then(r => r.data), enabled: role === 'ADMIN' || role === 'DELIVERY' || role === 'SUPER_ADMIN' });

  const getStatValue = (key: string): string | number => {
    if (key === 'totalMedicines') return invStats?.totalMedicines ?? '—';
    if (key === 'totalStock') return invStats?.totalStock ?? '—';
    if (key === 'lowStockCount') return invStats?.lowStockCount ?? '—';
    if (key === 'expiringSoonCount') return invStats?.expiringSoonCount ?? '—';
    if (key === 'orderTotal') return orderStats?.total ?? '—';
    if (key === 'orderPending') return orderStats?.pending ?? '—';
    if (key === 'delInTransit') return delStats?.inTransit ?? '—';
    if (key === 'delDelivered') return delStats?.delivered ?? '—';
    return '—';
  };

  const pipelineData = orderStats
    ? [
        { name: 'Pending', count: Number(orderStats.pending) },
        { name: 'Approved', count: Number(orderStats.approved) },
        { name: 'Shipped', count: Number(orderStats.shipped) },
        { name: 'Delivered', count: Number(orderStats.delivered) },
      ]
    : PIPELINE_DATA;

  if (role === 'SUPER_ADMIN') {
    return (
      <div className="page active">
        <div className="stats-grid-4 mt14">
          <StatCardSpec ico="ico-teal" emoji="👥" label="Total Users" value={userStats?.total ?? '—'} />
          <StatCardSpec ico="ico-blue" emoji="👥" label="Admins" value={userStats?.admins ?? '—'} />
          <StatCardSpec ico="ico-green" emoji="👥" label="Retailers" value={userStats?.retailers ?? '—'} />
          <StatCardSpec ico="ico-orange" emoji="🚚" label="Delivery Staff" value={userStats?.delivery ?? '—'} />
          <StatCardSpec ico="ico-purple" emoji="📦" label="Medicines" value={invStats?.totalMedicines ?? '—'} />
          <StatCardSpec ico="ico-cyan" emoji="🛒" label="Total Orders" value={orderStats?.total ?? '—'} />
          <StatCardSpec ico="ico-amber" emoji="⏳" label="Pending Orders" value={orderStats?.pending ?? '—'} />
          <StatCardSpec ico="ico-green" emoji="✅" label="Delivered" value={orderStats?.delivered ?? '—'} />
        </div>
      </div>
    );
  }

  if (role === 'ADMIN') {
    return (
      <div className="page active">
        <div className="stats-grid-4 mt14">
          {DASHBOARD_STATS.map((s) => (
            <StatCardSpec
              key={s.key}
              ico={s.ico}
              emoji={s.emoji}
              label={s.label}
              value={getStatValue(s.key)}
              to={s.to}
            />
          ))}
        </div>
        <div className="two-col mt20">
          <div className="panel">
            <div className="panel-hdr">
              <span className="panel-title">Order Pipeline</span>
            </div>
            <div className="panel-body">
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--chart-tick)' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'var(--text-white)' }} />
                    <Bar dataKey="count" fill="#1ab8cc" radius={[7, 7, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-hdr">
              <span className="panel-title">Recent Activity</span>
            </div>
            <div className="panel-body">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="tl-item">
                  <div className={`tl-dot ${a.type}`} />
                  <div className="tl-body">
                    <div className="tl-text">{a.text}</div>
                    <div className="tl-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel mt20">
          <div className="panel-hdr">
            <span className="panel-title">Stock by Category</span>
          </div>
          <div className="panel-body">
            <div className="space-y-4">
              {STOCK_BY_CATEGORY.map((row) => (
                <div key={row.name} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text-white)' }}>{row.name}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{row.units.toLocaleString()} units</span>
                    </div>
                    <div className="prog-wrap">
                      <div className={`prog-bar ${row.prog}`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-10 text-right" style={{ color: 'var(--text-muted)' }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'RETAILER') {
    return (
      <div className="page active">
        <div className="stats-grid-4 mt14">
          <StatCardSpec ico="ico-teal" emoji="🛒" label="My Orders" value={orderStats?.total ?? '—'} />
          <StatCardSpec ico="ico-amber" emoji="⏳" label="Pending" value={orderStats?.pending ?? '—'} />
          <StatCardSpec ico="ico-blue" emoji="🚚" label="Shipped" value={orderStats?.shipped ?? '—'} />
          <StatCardSpec ico="ico-green" emoji="✅" label="Delivered" value={orderStats?.delivered ?? '—'} />
        </div>
        <div className="panel mt20">
          <div className="panel-hdr">
            <span className="panel-title">Quick Actions</span>
          </div>
          <div className="panel-body flex gap-3 flex-wrap">
            <Link to="/catalog" className="tb-btn primary">Browse Catalog</Link>
            <Link to="/my-orders" className="tb-btn">View Orders</Link>
            <Link to="/cart" className="tb-btn">Go to Cart</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="stats-grid-4 mt14">
        <StatCardSpec ico="ico-teal" emoji="🚚" label="Total Deliveries" value={delStats?.total ?? '—'} />
        <StatCardSpec ico="ico-amber" emoji="⏳" label="Assigned" value={delStats?.assigned ?? '—'} />
        <StatCardSpec ico="ico-blue" emoji="📤" label="In Transit" value={delStats?.inTransit ?? '—'} />
        <StatCardSpec ico="ico-green" emoji="✅" label="Completed" value={delStats?.delivered ?? '—'} />
      </div>
    </div>
  );
}
