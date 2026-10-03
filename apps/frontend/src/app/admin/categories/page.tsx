'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

const emptyForm = { name: '', slug: '', parentId: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    adminFetch<Category[]>('/categories')
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  function openEdit(c: Category) {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, parentId: c.parentId ?? '' });
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
        slug: form.slug,
        parentId: form.parentId || undefined,
      };
      if (editingId) {
        await adminFetch(`/categories/${editingId}`, { method: 'PATCH', body });
      } else {
        await adminFetch('/categories', { method: 'POST', body });
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    await adminFetch(`/categories/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
          Categories
        </h1>
        <button
          onClick={openCreate}
          className="bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          + Add category
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-2 gap-4 border border-[var(--color-ink)]/10 p-6"
        >
          <h2 className="col-span-2 font-[var(--font-display)] text-lg">
            {editingId ? 'Edit category' : 'New category'}
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
            <label className={labelClass}>Slug</label>
            <input
              required
              className={inputClass}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Parent category (optional)</label>
            <select
              className={inputClass}
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <option value="">None</option>
              {categories
                .filter((c) => c.id !== editingId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

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
                <th className="py-2 font-normal">Slug</th>
                <th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink)]/10">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="py-3">{c.name}</td>
                  <td className="py-3 text-[var(--color-stone)]">{c.slug}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => openEdit(c)} className="mr-3 underline">
                      Edit
                    </button>
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