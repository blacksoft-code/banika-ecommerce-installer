'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/payment', label: 'Payment' },
  { href: '/admin/shipping', label: 'Shipping' },
  { href: '/admin/themes', label: 'Themes' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--color-stone)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 flex-shrink-0 border-r border-[var(--color-ink)]/10 bg-[var(--color-ink)] px-6 py-8 text-[var(--color-paper)]">
        <Link href="/admin" className="font-[var(--font-display)] text-xl">
          Banika
        </Link>
        <p className="mt-1 text-xs text-[var(--color-paper)]/50">Admin</p>

        <nav className="mt-10 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block py-2 text-sm ${
                pathname === item.href
                  ? 'text-[var(--color-marigold)]'
                  : 'text-[var(--color-paper)]/70 hover:text-[var(--color-paper)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-10 text-sm text-[var(--color-paper)]/50 hover:text-[var(--color-paper)]"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}