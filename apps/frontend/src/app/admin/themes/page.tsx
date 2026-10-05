'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type Theme = {
  id: string;
  name: string;
  label: string;
  isActive: boolean;
  config: { primaryColor?: string; accentColor?: string } | null;
};

const emptyForm = { name: '', label: '', primaryColor: '#14213d', accentColor: '#e8a33d' };

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    adminFetch<Theme[]>('/themes').then(setThemes).finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await adminFetch('/themes', {
        method: 'POST',
        body: {
          name: form.name,
          label: form.label,
          config: { primaryColor: form.primaryColor, accentColor: form.accentColor },
        },
      });
      setShowForm(false);
      setForm(emptyForm);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create theme.');
    } finally {
      setSaving(false);
    }
  }

  async function activate(id: string) {
    await adminFetch(`/themes/${id}/activate`, { method: 'PATCH' });
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this theme?')) return;
    try {
      await adminFetch(`/themes/${id}`, { method: 'DELETE' });
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete theme.');
    }
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
          Themes
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          + Add theme
        </button>
      </div>

      <p className="mt-2 text-sm text-[var(--color-stone)]">
        Manage which theme is active. Color customization is saved here for future use.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-2 gap-4 border border-[var(--color-ink)]/10 p-6"
        >
          <h2 className="col-span-2 font-[var(--font-display)] text-lg">New theme</h2>
          {error && (
            <p className="col-span-2 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
              {error}
            </p>
          )}
          <div>
            <label className={labelClass}>Internal name (slug)</label>
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Display label</label>
            <input
              required
              className={inputClass}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Primary color</label>
            <input
              type="color"
              className="mt-1 h-9 w-full"
              value={form.primaryColor}
              onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Accent color</label>
            <input
              type="color"
              className="mt-1 h-9 w-full"
              value={form.accentColor}
              onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? (
          <p className="text-[var(--color-stone)]">Loading…</p>
        ) : (
          themes.map((t) => (
            <div
              key={t.id}
              className={`border p-5 ${
                t.isActive ? 'border-[var(--color-marigold)]' : 'border-[var(--color-ink)]/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-[var(--color-ink)]">{t.label}</p>
                {t.isActive && (
                  <span className="text-xs text-[var(--color-marigold)]">Active</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                {t.config?.primaryColor && (
                  <span
                    className="h-6 w-6 rounded-full border border-[var(--color-ink)]/10"
                    style={{ backgroundColor: t.config.primaryColor }}
                  />
                )}
                {t.config?.accentColor && (
                  <span
                    className="h-6 w-6 rounded-full border border-[var(--color-ink)]/10"
                    style={{ backgroundColor: t.config.accentColor }}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                {!t.isActive && (
                  <button onClick={() => activate(t.id)} className="underline">
                    Activate
                  </button>
                )}
                {!t.isActive && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-[var(--color-clay)] underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}