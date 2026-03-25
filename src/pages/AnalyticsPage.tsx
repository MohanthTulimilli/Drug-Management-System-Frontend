import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI, inventoryAPI, ordersAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const { data: userStats } = useQuery({ queryKey: ['userStats'], queryFn: () => usersAPI.stats().then(r => r.data) });
  const { data: orderStats } = useQuery({ queryKey: ['orderStats'], queryFn: () => ordersAPI.stats().then(r => r.data) });
  const { data: invStats } = useQuery({ queryKey: ['invStats'], queryFn: () => inventoryAPI.dashboard().then(r => r.data) });

  const userChart = userStats ? [
    { name: 'Admins', value: Number(userStats.admins) },
    { name: 'Retailers', value: Number(userStats.retailers) },
    { name: 'Delivery', value: Number(userStats.delivery) },
  ] : [];

  const orderChart = orderStats ? [
    { name: 'Pending', value: Number(orderStats.pending) },
    { name: 'Approved', value: Number(orderStats.approved) },
    { name: 'Shipped', value: Number(orderStats.shipped) },
    { name: 'Delivered', value: Number(orderStats.delivered) },
    { name: 'Cancelled', value: Number(orderStats.cancelled) },
  ] : [];

  return (
    <div className="page active">
      <div className="two-col mt14">
        <div className="panel">
          <div className="panel-hdr"><span className="panel-title">Users by Role</span></div>
          <div className="panel-body">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={userChart} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {userChart.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="panel-hdr"><span className="panel-title">Orders by Status</span></div>
          <div className="panel-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
          </div>
        </div>
        <div className="panel mt20" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-hdr"><span className="panel-title">Inventory Overview</span></div>
          <div className="panel-body">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl"><p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{invStats?.totalMedicines ?? '—'}</p><p className="text-xs text-muted mt-1">Medicines</p></div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl"><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invStats?.totalBatches ?? '—'}</p><p className="text-xs text-muted mt-1">Batches</p></div>
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl"><p className="text-2xl font-bold text-green-600 dark:text-green-400">{invStats?.totalStock ?? '—'}</p><p className="text-xs text-muted mt-1">Total Stock</p></div>
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl"><p className="text-2xl font-bold text-red-600 dark:text-red-400">{invStats?.lowStockCount ?? '—'}</p><p className="text-xs text-muted mt-1">Low Stock</p></div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl"><p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{invStats?.expiringSoonCount ?? '—'}</p><p className="text-xs text-muted mt-1">Expiring Soon</p></div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
