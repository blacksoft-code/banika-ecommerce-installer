'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1, label: 'Admin account' },
  { n: 2, label: 'Business details' },
  { n: 3, label: 'Review & finish' },
] as const;

export default function InstallPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [admin, setAdmin] = useState({ name: '', email: '', password: '' });
  const [business, setBusiness] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessInfo: '',
    activeTheme: 'default',
  });

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient('/install/admin', { method: 'POST', body: admin });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleBusinessSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient('/install/business', { method: 'POST', body: business });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalize() {
    setError('');
    setLoading(true);
    try {
      await apiClient('/install/finalize', { method: 'POST' });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-sm text-[var(--color-stone)]';

  return (
    <div className="flex min-h-screen">
      {/* বাম প্যানেল — ধাপের তালিকা (সত্যিকারের sequence বলেই numbered) */}
      <div className="hidden w-[34%] flex-col justify-between bg-[var(--color-ink)] px-12 py-14 text-[var(--color-paper)] lg:flex">
        <p className="font-[var(--font-display)] text-2xl">Banika</p>
        <ol className="space-y-6">
          {STEPS.map((s) => (
            <li key={s.n} className="flex items-baseline gap-4">
              <span
                className={`font-[var(--font-display)] text-xl ${
                  s.n === step ? 'text-[var(--color-marigold)]' : 'text-[var(--color-paper)]/40'
                }`}
              >
                {String(s.n).padStart(2, '0')}
              </span>
              <span className={s.n === step ? 'text-[var(--color-paper)]' : 'text-[var(--color-paper)]/40'}>
                {s.label}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-[var(--color-paper)]/50">
          Setting up your store, one step at a time.
        </p>
      </div>

      {/* ডান প্যানেল — ফর্ম */}
      <div className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          {error && (
            <p className="mb-5 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
              {error}
            </p>
          )}

          {step === 1 && (
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
                Create your admin account
              </h1>
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={admin.name}
                  onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={admin.email}
                  onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className={inputClass}
                  value={admin.password}
                  onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Continue'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleBusinessSubmit} className="space-y-5">
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
                Tell us about your business
              </h1>
              <div>
                <label className={labelClass}>Business name</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={business.businessName}
                  onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Business email (optional)</label>
                <input
                  type="email"
                  className={inputClass}
                  value={business.businessEmail}
                  onChange={(e) => setBusiness({ ...business, businessEmail: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Business phone (optional)</label>
                <input
                  type="text"
                  className={inputClass}
                  value={business.businessPhone}
                  onChange={(e) => setBusiness({ ...business, businessPhone: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Description (optional)</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={business.businessInfo}
                  onChange={(e) => setBusiness({ ...business, businessInfo: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Theme</label>
                <select
                  className={inputClass}
                  value={business.activeTheme}
                  onChange={(e) => setBusiness({ ...business, activeTheme: e.target.value })}
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Continue'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
                Ready to launch
              </h1>
              <div className="space-y-2 border-y border-[var(--color-ink)]/10 py-5 text-sm">
                <p className="flex justify-between">
                  <span className="text-[var(--color-stone)]">Admin</span>
                  <span>{admin.name} · {admin.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--color-stone)]">Business</span>
                  <span>{business.businessName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--color-stone)]">Theme</span>
                  <span className="capitalize">{business.activeTheme}</span>
                </p>
              </div>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                {loading ? 'Launching your store…' : 'Complete installation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}