'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-[var(--color-ink)]/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-[var(--font-display)] text-xl text-[var(--color-ink)]">
          Banika
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/cart" className="text-[var(--color-ink)] hover:text-[var(--color-marigold)]">
            Cart
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="text-[var(--color-ink)] hover:text-[var(--color-marigold)]"
            >
              Log out
            </button>
          ) : (
            <Link href="/login" className="text-[var(--color-ink)] hover:text-[var(--color-marigold)]">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}