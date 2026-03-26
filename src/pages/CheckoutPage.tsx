import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { paymentAPI, type OrderPayload } from '../api';
import { useAuth } from '../context/AuthContext';
import { Store, MapPin, FileText, Check, Printer } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const CART_KEY = 'cart';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<OrderPayload | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const items = raw ? JSON.parse(raw) : [];
      setCart(Array.isArray(items) ? items : []);
      if (user) {
        setOwnerName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '');
      }
    } catch {
      setCart([]);
    }
    setLoaded(true);
  }, [user]);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const completeMut = useMutation({
    mutationFn: (payload: Parameters<typeof paymentAPI.completeOrder>[0]) =>
      paymentAPI.completeOrder(payload),
    onSuccess: (order) => {
      localStorage.removeItem(CART_KEY);
      setCart([]);
      setShowSuccess(true);
      setReceiptOrder(order.data);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1800);
    },
    onError: (err: any) => {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 403 || status === 401) {
        setPaymentError(
          msg || 'Access denied. Please log in as a Retailer. If it persists, restart the backend and try again.'
        );
      } else {
        setPaymentError(msg || 'Payment failed. Please try again.');
      }
    },
  });

  const handlePay = () => {
    setPaymentError('');
    if (!shippingAddress.trim()) {
      setPaymentError('Please enter shipping address.');
      return;
    }
    if (!user) return;
    const retailerName = ownerName.trim() || user.email || 'Retailer';
    completeMut.mutate({
      retailerId: user.id,
      retailerName,
      shippingAddress: shippingAddress.trim(),
      notes: notes.trim() || undefined,
      shopName: shopName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      items: cart.map((c) => ({
        medicineId: c.id,
        medicineName: c.name,
        quantity: c.qty,
        unitPrice: c.price,
      })),
    });
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Receipt - ${receiptOrder?.orderNumber || 'Order'}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
            h1 { font-size: 18px; margin-bottom: 8px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { text-align: left; padding: 6px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; margin-top: 12px; }
            .foot { margin-top: 24px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>MedDist - Order Receipt</h1>
          <div class="meta">Order: ${receiptOrder?.orderNumber || ''} | Date: ${receiptOrder?.createdAt ? new Date(receiptOrder.createdAt).toLocaleString() : ''}</div>
          ${receiptOrder?.shopName ? `<p><strong>Shop:</strong> ${receiptOrder.shopName}</p>` : ''}
          ${receiptOrder?.retailerName ? `<p><strong>Bill To:</strong> ${receiptOrder.retailerName}</p>` : ''}
          ${receiptOrder?.shippingAddress ? `<p><strong>Address:</strong> ${receiptOrder.shippingAddress}</p>` : ''}
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${(receiptOrder?.items || []).map((i: any) => `<tr><td>${i.medicineName}</td><td>${i.quantity}</td><td>₹${Number(i.unitPrice).toFixed(2)}</td><td>₹${Number(i.totalPrice || i.unitPrice * i.quantity).toFixed(2)}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="total">Total: ₹${receiptOrder?.totalAmount?.toFixed(2) ?? '0.00'}</div>
          <div class="foot">Thank you for your order.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const closeReceipt = () => {
    setReceiptOrder(null);
    navigate('/my-orders');
  };

  if (!loaded) {
    return (
      <div className="page active flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cart.length === 0 && !receiptOrder) {
    return (
      <div className="page active">
        <div className="card text-center py-12">
          <p className="text-secondary text-lg">Your cart is empty.</p>
          <button type="button" onClick={() => navigate('/cart')} className="btn-primary mt-4">
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <p className="text-xl font-semibold text-primary">Payment Successful!</p>
            <p className="text-secondary text-sm mt-1">Order placed successfully</p>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {receiptOrder && !showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div ref={receiptRef} className="p-6">
              <h2 className="text-xl font-bold text-primary mb-1">Order Receipt</h2>
              <p className="text-sm text-secondary">#{receiptOrder.orderNumber}</p>
              <p className="text-xs text-muted mt-1">
                {receiptOrder.createdAt
                  ? new Date(receiptOrder.createdAt).toLocaleString()
                  : ''}
              </p>
              {receiptOrder.shopName && (
                <p className="text-sm mt-2 text-primary"><strong>Shop:</strong> {receiptOrder.shopName}</p>
              )}
              {receiptOrder.retailerName && (
                <p className="text-sm text-primary"><strong>Bill To:</strong> {receiptOrder.retailerName}</p>
              )}
              {receiptOrder.shippingAddress && (
                <p className="text-sm text-secondary mt-1"><strong>Address:</strong> {receiptOrder.shippingAddress}</p>
              )}
              <div className="border-t border-slate-200 dark:border-slate-600 mt-4 pt-4">
                {(receiptOrder.items || []).map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-primary">{i.medicineName} × {i.quantity}</span>
                    <span>₹{Number(i.totalPrice ?? i.unitPrice * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t border-slate-200 dark:border-slate-600">
                <span className="text-primary">Total</span>
                <span>₹{receiptOrder.totalAmount?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={closeReceipt}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-primary hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!receiptOrder && (
        <>
          <h1 className="text-2xl font-bold mb-6 text-primary">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                  <Store className="w-5 h-5" /> Shop & Owner Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Shop / Store Name</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="e.g. Medical Shop A"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Owner Name</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Full name"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Contact Phone</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="10-digit mobile"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Shipping Address
                </h2>
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Full address (street, city, state, PIN)"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary mb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4" /> Notes (optional)
                  </label>
                  <textarea
                    className="input w-full"
                    rows={2}
                    placeholder="Order notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="card h-fit sticky top-24">
              <h3 className="text-lg font-semibold mb-4 text-primary">Order Summary</h3>
              <ul className="space-y-2 text-sm text-secondary border-b border-slate-200 dark:border-slate-600 pb-3">
                {cart.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span className="text-primary">{c.name} × {c.qty}</span>
                    <span>₹{(c.price * c.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm mt-3">
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
              {paymentError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{paymentError}</p>
              )}
              <button
                onClick={handlePay}
                disabled={completeMut.isPending}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {completeMut.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{total.toFixed(2)}</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full mt-3 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
