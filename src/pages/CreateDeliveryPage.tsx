import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { Truck, ArrowLeft } from 'lucide-react';

export default function CreateDeliveryPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.email.trim()) { setError('Valid email is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.registerDelivery(form);
      setSuccess(true);
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create delivery person');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="flex items-center gap-4 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="tb-btn flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-white)' }}>Create Delivery Person</h1>
      </div>

      <div className="panel" style={{ maxWidth: 480 }}>
        <div className="panel-hdr">
          <span className="panel-title flex items-center gap-2">
            <Truck className="w-5 h-5" /> New Delivery Account
          </span>
        </div>
        <div className="panel-body">
          {success && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>
              Delivery person created successfully. They can now log in with the provided email and password.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="field">
              <label className="label" htmlFor="delivery-name">Name</label>
              <input
                id="delivery-name"
                type="text"
                className="input"
                placeholder="e.g. Delivery Boy 1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="delivery-email">Email</label>
              <input
                id="delivery-email"
                type="email"
                className="input"
                placeholder="delivery@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="delivery-password">Password</label>
              <input
                id="delivery-password"
                type="password"
                className="input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="tb-btn primary w-full" disabled={loading}>
                {loading ? 'Creating…' : 'Create Delivery'}
              </button>
              <button type="button" className="tb-btn" onClick={() => navigate('/manage-delivery')}>
                View Delivery Personnel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
