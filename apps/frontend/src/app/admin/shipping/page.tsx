'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type Method = {
  id: string;
  name: string;
  description: string | null;
  rate: number;
  isActive: boolean;
};

const emptyForm = { name: '', description: '', rate: '', isActive: true };

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    adminFetch<Method[]>('/shipping-methods/admin')
      .then(setMethods)
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  function openEdit(m: Method) {
    setEditingId(m.id);
    setForm({
      name: m.name,
      description: m.description ?? '',
      rate: String(m.rate),
      isActive: m.isActive,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || undefined,
        rate: Number(form.rate),
        isActive: form.isActive,
      };
      if (editingId) {
        await adminFetch(`/shipping-methods/${editingId}`, { method: 'PATCH', body });
      } else {
        await adminFetch('/shipping-methods', { method: 'POST', body });
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this shipping method?')) return;
    await adminFetch(`/shipping-methods/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
          Shipping Methods
        </h1>
        <button
          onClick={openCreate}
          className="bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          + Add method
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-2 gap-4 border border-[var(--color-ink)]/10 p-6"
        >
          <h2 className="col-span-2 font-[var(--font-display)] text-lg">
            {editingId ? 'Edit method' : 'New method'}
          </h2>
          {error && (
            <p className="col-span-2 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
              {error}
            </p>
          )}
          <div>
            <label className={labelClass}>Name</label>
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Rate (৳)</label>
            <input
              type="number"
              required
              className={inputClass}
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description (optional)</label>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active (available at checkout)
          </label>
          <div className="col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--color-ink)] px-5 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
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
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/10 text-[var(--color-stone)]">
                <th className="py-2 font-normal">Name</th>
                <th className="py-2 font-normal">Rate</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink)]/10">
              {methods.map((m) => (
                <tr key={m.id}>
                  <td className="py-3">{m.name}</td>
                  <td className="py-3">৳{m.rate}</td>
                  <td className="py-3">
                    {m.isActive ? (
                      <span className="text-[var(--color-bazaar-green)]">Active</span>
                    ) : (
                      <span className="text-[var(--color-stone)]">Hidden</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => openEdit(m)} className="mr-3 underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
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