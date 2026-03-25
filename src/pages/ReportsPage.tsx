import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI, deliveriesAPI, inventoryAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area } from 'recharts';

const PIPELINE_DATA = [
  { name: 'Pending', count: 0 },
  { name: 'Approved', count: 0 },
  { name: 'Shipped', count: 3 },
  { name: 'Delivered', count: 2 },
];

const STOCK_DOUGHNUT = [
  { name: 'Antibiotics', value: 1240 },
  { name: 'Antifungals', value: 860 },
  { name: 'Antivirals', value: 620 },
  { name: 'Cardiovascular', value: 1870 },
];

const REVENUE_DATA = [
  { month: 'Jan', value: 3200 },
  { month: 'Feb', value: 4100 },
  { month: 'Mar', value: 8042 },
  { month: 'Apr', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Jun', value: 0 },
];

const COLORS = ['#1ab8cc', '#22c98a', '#8b74f5', '#f59e0b'];

export default function ReportsPage() {
  const { data: orderStats } = useQuery({ queryKey: ['orderStats'], queryFn: () => ordersAPI.stats().then(r => r.data) });
  const { data: delStats } = useQuery({ queryKey: ['delStats'], queryFn: () => deliveriesAPI.stats().then(r => r.data) });
  const { data: invStats } = useQuery({ queryKey: ['invStats'], queryFn: () => inventoryAPI.dashboard().then(r => r.data) });

  useEffect(() => {
    const parent = document.querySelector('.chip-group');
    if (!parent) return;
    parent.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', function (this: Element) {
        parent.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
        this.classList.add('on');
      });
    });
    return () => parent.querySelectorAll('.chip').forEach((c) => c.replaceWith(c.cloneNode(true)));
  }, []);

  const pipelineData = orderStats
    ? [
        { name: 'Pending', count: Number(orderStats.pending) },
        { name: 'Approved', count: Number(orderStats.approved) },
        { name: 'Shipped', count: Number(orderStats.shipped) },
        { name: 'Delivered', count: Number(orderStats.delivered) },
      ]
    : PIPELINE_DATA;

  const revenue = 8042; // MTD from spec; could derive from API

  return (
    <div className="page active">
      <div className="two-col mt14">
        <div className="panel">
          <div className="panel-hdr flex-wrap gap-2">
            <span className="panel-title">Order Pipeline</span>
            <div className="chip-group flex gap-2">
              <span className="chip on">Weekly</span>
              <span className="chip">Monthly</span>
            </div>
          </div>
          <div className="panel-body">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--chart-tick)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--chart-tick)' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }} />
                  <Bar dataKey="count" fill="#1ab8cc" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-hdr">
            <span className="panel-title">Summary</span>
          </div>
          <div className="panel-body">
            <div className="sum-row">
              <span className="sum-lbl">Total Orders</span>
              <span className="sum-val">{orderStats?.total ?? 5}</span>
            </div>
            <div className="sum-row">
              <span className="sum-lbl">Total Deliveries</span>
              <span className="sum-val">{delStats?.total ?? 5}</span>
            </div>
            <div className="sum-row">
              <span className="sum-lbl">Medicines</span>
              <span className="sum-val">{invStats?.totalMedicines ?? 99}</span>
            </div>
            <div className="sum-row">
              <span className="sum-lbl">Stock Units</span>
              <span className="sum-val">{invStats?.totalStock ?? 4590}</span>
            </div>
            <div className="sum-row">
              <span className="sum-lbl">Revenue (MTD)</span>
              <span className="sum-val green">₹{revenue.toLocaleString()}</span>
            </div>
            <div className="sum-row">
              <span className="sum-lbl">Low Stock Items</span>
              <span className="sum-val red">{invStats?.lowStockCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="two-col mt20">
        <div className="panel">
          <div className="panel-hdr">
            <span className="panel-title">Stock Distribution</span>
          </div>
          <div className="panel-body">
            <div className="chart-wrap" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={STOCK_DOUGHNUT}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={1}
                    dataKey="value"
                    stroke="var(--doughnut-border)"
                    strokeWidth={2}
                  >
                    {STOCK_DOUGHNUT.map((_, i) => (
                      <Cell key={i} fill={`${COLORS[i % COLORS.length]}bf`} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }} formatter={(v: number) => [`${v} units`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-hdr">
            <span className="panel-title">Revenue Trend</span>
          </div>
          <div className="panel-body">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--chart-tick)' }} />
                  <YAxis tick={{ fill: 'var(--chart-tick)' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }} formatter={(v: number) => [`₹${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="value" stroke="#1ab8cc" fill="rgba(26,184,204,0.25)" strokeWidth={2} />
                  <Line type="monotone" dataKey="value" stroke="#1ab8cc" strokeWidth={2} dot={{ fill: '#1ab8cc', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
