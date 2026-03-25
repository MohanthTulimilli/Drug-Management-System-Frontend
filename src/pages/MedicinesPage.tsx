import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../api';
import { Plus, Search, Pill, Edit2 } from 'lucide-react';

export default function MedicinesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', genericName: '', manufacturer: '', category: '', description: '', dosageForm: 'Tablet', strength: '', unitPrice: '', prescriptionRequired: false });

  const { data: medicines = [], isLoading } = useQuery({ queryKey: ['medicines', search], queryFn: () => inventoryAPI.getMedicines(search).then(r => r.data) });

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? inventoryAPI.updateMedicine(editId, d) : inventoryAPI.createMedicine(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicines'] }); setShowForm(false); setEditId(null); resetForm(); }
  });

  const resetForm = () => setForm({ name: '', genericName: '', manufacturer: '', category: '', description: '', dosageForm: 'Tablet', strength: '', unitPrice: '', prescriptionRequired: false });
  const startEdit = (m: any) => { setForm({ name: m.name, genericName: m.genericName || '', manufacturer: m.manufacturer || '', category: m.category || '', description: m.description || '', dosageForm: m.dosageForm || '', strength: m.strength || '', unitPrice: String(m.unitPrice || ''), prescriptionRequired: m.prescriptionRequired }); setEditId(m.id); setShowForm(true); };

  return (
    <div className="page active">
      {showForm && (
        <div className="panel mb-6">
          <div className="panel-hdr">
            <span className="panel-title">{editId ? 'Edit' : 'Add'} Medicine</span>
          </div>
          <div className="panel-body">
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate({ ...form, unitPrice: parseFloat(form.unitPrice) || 0 }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input" placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Generic Name" value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} />
              <input className="input" placeholder="Manufacturer" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} />
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select Category</option>
                {['Pain Relief', 'Antibiotics', 'Anti-inflammatory', 'Diabetes', 'Gastrointestinal', 'Allergy', 'Cardiovascular', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input" value={form.dosageForm} onChange={e => setForm({ ...form, dosageForm: e.target.value })}>
                {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <input className="input" placeholder="Strength (e.g. 500mg)" value={form.strength} onChange={e => setForm({ ...form, strength: e.target.value })} />
              <input className="input" type="number" step="0.01" placeholder="Unit Price" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required />
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}><input type="checkbox" checked={form.prescriptionRequired} onChange={e => setForm({ ...form, prescriptionRequired: e.target.checked })} className="rounded" /> Prescription Required</label>
              <div className="md:col-span-2"><textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" className="tb-btn primary" disabled={saveMut.isPending}>{saveMut.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
                <button type="button" className="tb-btn" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="tbar">
          <div className="tsearch">
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="button" onClick={() => { resetForm(); setEditId(null); setShowForm(!showForm); }} className="tb-btn primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        </div>
        {isLoading ? <div className="p-6" style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Generic Name</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m: any) => (
                  <tr key={m.id}>
                    <td className="primary">{m.name}</td>
                    <td>{m.category || '—'}</td>
                    <td>{m.genericName || '—'}</td>
                    <td>{m.dosageForm} {m.strength}</td>
                    <td>₹{m.unitPrice?.toFixed(2)}</td>
                    <td>{m.totalStock ?? '—'}</td>
                    <td><span className="badge badge-active">ACTIVE</span></td>
                    <td>
                      <button type="button" onClick={() => startEdit(m)} className="act-btn flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && medicines.length > 0 && (
          <div className="pagi">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing 1–{medicines.length} of {medicines.length} medicines</span>
            <div className="flex gap-1"><button type="button" className="pg-btn cur">1</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
