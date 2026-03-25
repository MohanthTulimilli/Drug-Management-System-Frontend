import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../api';
import { AlertTriangle, Clock, Trash2, CheckCircle2 } from 'lucide-react';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: batches = [], isLoading } = useQuery({ queryKey: ['batches'], queryFn: () => inventoryAPI.getBatches().then(r => r.data) });
  const { data: lowStock = [] } = useQuery({ queryKey: ['lowStock'], queryFn: () => inventoryAPI.getLowStock().then(r => r.data) });
  const { data: expiring = [] } = useQuery({ queryKey: ['expiring'], queryFn: () => inventoryAPI.getExpiring().then(r => r.data) });

  const deleteMut = useMutation({
    mutationFn: (ids: number[]) => inventoryAPI.deleteBatchesBulk(ids),
    onSuccess: (_, ids) => {
      setSelectedIds(new Set());
      setErrorMessage(null);
      setSuccessMessage(`${ids.length} batch(es) deleted successfully.`);
      qc.invalidateQueries({ queryKey: ['batches'] });
      qc.invalidateQueries({ queryKey: ['lowStock'] });
      qc.invalidateQueries({ queryKey: ['expiring'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Delete failed. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const allIds = batches.map((b: any) => b.id);
  const allSelected = batches.length > 0 && allIds.every((id: number) => selectedIds.has(id));

  const toggleOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(allIds));
  };

  const handleDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (window.confirm(`Delete ${ids.length} selected batch(es)?`)) deleteMut.mutate(ids);
  };

  const statusColor: Record<string, string> = { ACTIVE: 'badge-green', EXPIRED: 'badge-red', RECALLED: 'badge-red', DEPLETED: 'badge-yellow' };

  return (
    <div className="page active">
      <div className="stats-grid-4 mt14" style={{ marginBottom: 0 }}>
        <div className="stat-card"><div className="stat-ico ico-teal">📦</div><div><div className="stat-val">{batches?.length ?? 0}</div><div className="stat-lbl">Total Batches</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-blue">🗃️</div><div><div className="stat-val">{batches?.reduce((s: number, b: any) => s + (b.quantityAvailable ?? 0), 0)}</div><div className="stat-lbl">Available Units</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-red">⚠️</div><div><div className="stat-val">{lowStock?.length ?? 0}</div><div className="stat-lbl">Low Stock</div></div></div>
        <div className="stat-card"><div className="stat-ico ico-amber">⏰</div><div><div className="stat-val">{expiring?.length ?? 0}</div><div className="stat-lbl">Expiring Soon</div></div></div>
      </div>
      <div className="mt20">
      {successMessage && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {(lowStock.length > 0 || expiring.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {lowStock.length > 0 && <div className="card border-l-4 border-l-red-500">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-red-500" /><h3 className="font-semibold text-red-700 dark:text-red-300">Low Stock Alert</h3></div>
            <ul className="space-y-1 text-sm text-secondary">{lowStock.map((b: any) => <li key={b.id}>{b.medicine?.name} — Batch {b.batchNumber}: {b.quantityAvailable} units</li>)}</ul>
          </div>}
          {expiring.length > 0 && <div className="card border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-yellow-500" /><h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Expiring Soon</h3></div>
            <ul className="space-y-1 text-sm text-secondary">{expiring.map((b: any) => <li key={b.id}>{b.medicine?.name} — Batch {b.batchNumber}: expires {b.expiryDate}</li>)}</ul>
          </div>}
        </div>
      )}

      <div className="table-card">
        <div className="tbar">
          <span className="panel-title">All Batches</span>
          {selectedIds.size > 0 && (
            <button type="button" onClick={handleDelete} disabled={deleteMut.isPending} className="tb-btn flex items-center gap-2" style={{ color: 'var(--red)' }}>
              <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
            </button>
          )}
        </div>
        {isLoading ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-10"><label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded" /> Select all</label></th>
                  <th>Medicine</th>
                  <th>Batch #</th>
                  <th>Available</th>
                  <th>Cost</th>
                  <th>Selling</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b: any) => (
                  <tr key={b.id}>
                    <td><input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleOne(b.id)} className="rounded" /></td>
                    <td className="primary">{b.medicine?.name || 'N/A'}</td>
                    <td><span className="mono">{b.batchNumber}</span></td>
                    <td><span style={b.quantityAvailable < 10 ? { color: 'var(--red)', fontWeight: 600 } : {}}>{b.quantityAvailable}</span></td>
                    <td>₹{b.costPrice?.toFixed(2)}</td>
                    <td>₹{b.sellingPrice?.toFixed(2)}</td>
                    <td>{b.expiryDate}</td>
                    <td><span className={`badge ${b.status === 'ACTIVE' ? 'badge-active' : b.status === 'EXPIRED' ? 'badge-inactive' : 'badge-pending'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && batches.length > 0 && (
          <div className="pagi">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing 1–{batches.length} of {batches.length} batches</span>
            <div className="flex gap-1"><button type="button" className="pg-btn cur">1</button></div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
