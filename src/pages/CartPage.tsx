import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  const save = useCallback((items: CartItem[]) => {
    setCart(items);
    localStorage.setItem('cart', JSON.stringify(items));
  }, []);
  const updateQty = (id: number, delta: number) => {
    const updated = cart.map((c) =>
      c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
    );
    save(updated);
  };
  const remove = (id: number) => save(cart.filter((c) => c.id !== id));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const proceedToCheckout = () => navigate('/checkout');

  return (
    <div className="page active">
      <h1 className="text-2xl font-bold mb-6 text-primary">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-secondary text-lg">Your cart is empty</p>
          <a href="/catalog" className="btn-primary inline-block mt-4">
            Browse Catalog
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="card flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-primary">{item.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 text-primary"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-primary">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 text-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-secondary">₹{item.price.toFixed(2)} each</p>
                <p className="font-bold w-20 text-right text-primary">
                  ₹{(item.price * item.qty).toFixed(2)}
                </p>
                <button
                  onClick={() => remove(item.id)}
                  className="p-2 text-red-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="card h-fit sticky top-24">
            <h3 className="text-lg font-semibold mb-4 text-primary">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Subtotal</span>
                <span className="text-primary">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tax (5%)</span>
                <span className="text-primary">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-600">
                <span className="text-primary">Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={proceedToCheckout}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
