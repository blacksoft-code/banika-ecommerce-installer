'use client';

import { useEffect, useState } from 'react';
import { adminFetch, uploadMedia } from '@/lib/admin-client';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    businessName: '',
    businessLogo: '',
    businessEmail: '',
    businessPhone: '',
    businessInfo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch<typeof form>('/settings/admin')
      .then((data) =>
        setForm({
          businessName: data.businessName ?? '',
          businessLogo: data.businessLogo ?? '',
          businessEmail: data.businessEmail ?? '',
          businessPhone: data.businessPhone ?? '',
          businessInfo: data.businessInfo ?? '',
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadMedia(file);
      setForm({ ...form, businessLogo: `${process.env.NEXT_PUBLIC_API_URL}${result.url}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await adminFetch('/settings', { method: 'PATCH', body: form });
      setMessage('Settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  if (loading) {
    return <p className="text-[var(--color-stone)]">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
        Store Settings
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-5">
        {error && (
          <p className="border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
            {error}
          </p>
        )}
        {message && (
          <p className="border-l-2 border-[var(--color-bazaar-green)] pl-3 text-sm text-[var(--color-bazaar-green)]">
            {message}
          </p>
        )}

        <div>
          <label className={labelClass}>Business name</label>
          <input
            required
            className={inputClass}
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Logo</label>
          <div className="mt-1 flex items-center gap-4">
            {form.businessLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.businessLogo} alt="Logo" className="h-14 w-14 object-contain" />
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="text-sm" />
          </div>
          {uploading && <p className="mt-1 text-xs text-[var(--color-stone)]">Uploading…</p>}
        </div>

        <div>
          <label className={labelClass}>Business email</label>
          <input
            type="email"
            className={inputClass}
            value={form.businessEmail}
            onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Business phone</label>
          <input
            className={inputClass}
            value={form.businessPhone}
            onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            className={inputClass}
            value={form.businessInfo}
            onChange={(e) => setForm({ ...form, businessInfo: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-[var(--color-ink)] px-5 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}