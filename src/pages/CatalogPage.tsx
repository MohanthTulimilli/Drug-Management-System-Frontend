import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryAPI } from '../api';
import { ShoppingCart, Pill, Search, Plus } from 'lucide-react';

interface CartItem { id: number; name: string; price: number; qty: number; batchId?: number }

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } });

  const { data: medicines = [], isLoading } = useQuery({ queryKey: ['catalog', search], queryFn: () => inventoryAPI.getMedicines(search || undefined).then(r => r.data) });

  const addToCart = (m: any) => {
    const updated = [...cart];
    const existing = updated.find(c => c.id === m.id);
    if (existing) existing.qty++;
    else updated.push({ id: m.id, name: m.name, price: m.unitPrice, qty: 1 });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Medicine Catalog</h1>
        <a href="/cart" className="btn-primary flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Cart ({cart.length}) — ₹{total.toFixed(2)}</a>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
        <input className="input pl-10" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? <p className="text-secondary">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((m: any) => {
            const inCart = cart.find(c => c.id === m.id);
            return (
              <div key={m.id} className="card card-hover">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{m.name}</h3>
                    <p className="text-xs text-secondary">{m.genericName} • {m.manufacturer}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.category && <span className="badge-blue text-[10px]">{m.category}</span>}
                  <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px]">{m.dosageForm} {m.strength}</span>
                </div>
                {m.description && <p className="text-xs text-muted mt-2 line-clamp-2">{m.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">₹{m.unitPrice?.toFixed(2)}</p>
                  <button onClick={() => addToCart(m)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${inCart ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-200' : 'btn-primary'}`}>
                    <Plus className="w-4 h-4" /> {inCart ? `In Cart (${inCart.qty})` : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
