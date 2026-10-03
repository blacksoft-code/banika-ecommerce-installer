'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { AuthShell } from '@/components/AuthShell';

type LoginResponse = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: 'ADMIN' | 'CUSTOMER' };
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: form,
      });
      login(res.accessToken, res.user);

      const guestToken = localStorage.getItem('banika_guest_token');
      if (guestToken) {
        await apiClient('/cart/merge', {
          method: 'POST',
          token: res.accessToken,
          body: { guestToken },
        }).catch(() => {});
        localStorage.removeItem('banika_guest_token');
      }

      router.push(res.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell tagline="Step back into your store.">
      <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
        Log in
      </h1>
      <p className="mt-2 text-sm text-[var(--color-stone)]">
        Enter your details to continue.
      </p>

      {error && (
        <p className="mt-5 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-sm text-[var(--color-stone)]">Email</label>
          <input
            type="email"
            required
            className="mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-marigold)]"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-[var(--color-stone)]">Password</label>
          <input
            type="password"
            required
            className="mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-marigold)]"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-stone)]">
        New here?{' '}
        <Link href="/register" className="text-[var(--color-ink)] underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}