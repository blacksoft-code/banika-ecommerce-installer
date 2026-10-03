'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { AuthShell } from '@/components/AuthShell';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient('/auth/register', { method: 'POST', body: form });
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell tagline="Join the marketplace.">
      <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--color-stone)]">
        Takes less than a minute.
      </p>

      {error && (
        <p className="mt-5 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {[
          { key: 'name', label: 'Full name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'phone', label: 'Phone (optional)', type: 'text', required: false },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-sm text-[var(--color-stone)]">{field.label}</label>
            <input
              type={field.type}
              required={field.required}
              minLength={field.key === 'password' ? 6 : undefined}
              className="mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-marigold)]"
              value={form[field.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-stone)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-ink)] underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}