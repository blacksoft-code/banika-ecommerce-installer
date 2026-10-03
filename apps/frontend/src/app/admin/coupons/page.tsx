'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type Coupon = {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
};

const emptyForm = {
  code: '',
  type: 'PERCENTAGE' as Coupon['type'],
  value: '',
  minOrderAmount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    adminFetch<Coupon[]>('/coupons').then(setCoupons).finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await adminFetch('/coupons', {
        method: 'POST',
        body: {
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
          isActive: form.isActive,
        },
      });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create coupon.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Coupon) {
    await adminFetch(`/coupons/${c.id}`, {
      method: 'PATCH',
      body: { isActive: !c.isActive },
    });
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    await adminFetch(`/coupons/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
          Coupons
        </h1>
        <button
          onClick={openCreate}
          className="bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          + Add coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-2 gap-4 border border-[var(--color-ink)]/10 p-6"
        >
          <h2 className="col-span-2 font-[var(--font-display)] text-lg">New coupon</h2>

          {error && (
            <p className="col-span-2 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
              {error}
            </p>
          )}

          <div>
            <label className={labelClass}>Code</label>
            <input
              required
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Coupon['type'] })}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed amount (৳)</option>
              <option value="FREE_SHIPPING">Free shipping</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Value {form.type === 'FREE_SHIPPING' ? '(ignored)' : ''}
            </label>
            <input
              type="number"
              className={inputClass}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Min. order amount (optional)</label>
            <input
              type="number"
              className={inputClass}
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Usage limit (optional)</label>
            <input
              type="number"
              className={inputClass}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Expires at (optional)</label>
            <input
              type="date"
              className={inputClass}
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--color-ink)] px-5 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-[var(--color-stone)] underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-[var(--color-stone)]">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="text-[var(--color-stone)]">No coupons yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/10 text-[var(--color-stone)]">
                <th className="py-2 font-normal">Code</th>
                <th className="py-2 font-normal">Type</th>
                <th className="py-2 font-normal">Value</th>
                <th className="py-2 font-normal">Used</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink)]/10">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 font-medium">{c.code}</td>
                  <td className="py-3 text-[var(--color-stone)]">{c.type}</td>
                  <td className="py-3">
                    {c.type === 'FREE_SHIPPING' ? '—' : c.type === 'PERCENTAGE' ? `${c.value}%` : `৳${c.value}`}
                  </td>
                  <td className="py-3">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={c.isActive ? 'text-[var(--color-bazaar-green)]' : 'text-[var(--color-stone)]'}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[var(--color-clay)] underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}