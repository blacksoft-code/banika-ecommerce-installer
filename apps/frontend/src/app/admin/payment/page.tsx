'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type GatewayType = 'STRIPE' | 'SSLCOMMERZ' | 'BKASH' | 'NAGAD' | 'COD';

type Gateway = {
  id: string;
  type: GatewayType;
  isActive: boolean;
  createdAt: string;
};

// প্রতিটা গেটওয়ে টাইপের জন্য কোন কোন credential field লাগবে
const FIELDS: Record<GatewayType, { key: string; label: string }[]> = {
  STRIPE: [
    { key: 'publishableKey', label: 'Publishable key' },
    { key: 'secretKey', label: 'Secret key' },
  ],
  SSLCOMMERZ: [
    { key: 'storeId', label: 'Store ID' },
    { key: 'storePassword', label: 'Store password' },
  ],
  BKASH: [
    { key: 'appKey', label: 'App key' },
    { key: 'appSecret', label: 'App secret' },
    { key: 'username', label: 'Username' },
    { key: 'password', label: 'Password' },
  ],
  NAGAD: [
    { key: 'merchantId', label: 'Merchant ID' },
    { key: 'merchantPrivateKey', label: 'Merchant private key' },
  ],
  COD: [],
};

export default function AdminPaymentPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<GatewayType>('SSLCOMMERZ');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    adminFetch<Gateway[]>('/payment-gateways')
      .then(setGateways)
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function openCreate() {
    setType('SSLCOMMERZ');
    setCredentials({});
    setIsActive(true);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await adminFetch('/payment-gateways', {
        method: 'POST',
        body: { type, credentials, isActive },
      });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save gateway.');
    } finally {
      setSaving(false);
    }
  }

  async function activate(id: string) {
    await adminFetch(`/payment-gateways/${id}`, {
      method: 'PATCH',
      body: { isActive: true },
    });
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this payment gateway?')) return;
    await adminFetch(`/payment-gateways/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
          Payment Gateways
        </h1>
        <button
          onClick={openCreate}
          className="bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          + Add gateway
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-2 gap-4 border border-[var(--color-ink)]/10 p-6"
        >
          <h2 className="col-span-2 font-[var(--font-display)] text-lg">
            Connect a gateway
          </h2>

          {error && (
            <p className="col-span-2 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
              {error}
            </p>
          )}

          <div className="col-span-2">
            <label className={labelClass}>Gateway</label>
            <select
              className={inputClass}
              value={type}
              onChange={(e) => {
                setType(e.target.value as GatewayType);
                setCredentials({});
              }}
            >
              {Object.keys(FIELDS).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {FIELDS[type].map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              <input
                required
                type="password"
                className={inputClass}
                value={credentials[field.key] ?? ''}
                onChange={(e) =>
                  setCredentials({ ...credentials, [field.key]: e.target.value })
                }
              />
            </div>
          ))}

          {FIELDS[type].length === 0 && (
            <p className="col-span-2 text-sm text-[var(--color-stone)]">
              Cash on Delivery needs no credentials.
            </p>
          )}

          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Make this the active gateway
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
        ) : gateways.length === 0 ? (
          <p className="text-[var(--color-stone)]">No payment gateways connected yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/10 text-[var(--color-stone)]">
                <th className="py-2 font-normal">Gateway</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink)]/10">
              {gateways.map((g) => (
                <tr key={g.id}>
                  <td className="py-3">{g.type}</td>
                  <td className="py-3">
                    {g.isActive ? (
                      <span className="text-[var(--color-bazaar-green)]">Active</span>
                    ) : (
                      <button onClick={() => activate(g.id)} className="underline">
                        Activate
                      </button>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-[var(--color-clay)] underline"
                    >
                      Remove
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