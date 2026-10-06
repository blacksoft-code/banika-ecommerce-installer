'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type StoreInfo = {
  businessName: string | null;
  businessLogo: string | null;
};

type Category = { id: string; name: string; slug: string };

export function Navbar() {
  const { user, logout } = useAuth();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`)
      .then((res) => res.json())
      .then(setStore)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <header className="border-b border-[var(--color-ink)]/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          {store?.businessLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.businessLogo}
              alt={store.businessName ?? 'Store logo'}
              className="h-8 w-8 object-contain"
            />
          ) : null}
          <span className="font-[var(--font-display)] text-xl text-[var(--color-ink)]">
            {store?.businessName || 'Banika'}
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/cart" className="text-[var(--color-ink)] hover:text-[var(--color-marigold)]">
            Cart
          </Link>
          {user && (
            <Link href="/wishlist" className="text-[var(--color-ink)] hover:text-[var(--color-marigold)]">
              Wishlist
            </Link>
          )}
          {user && (
            <Link href="/orders" className="text-[var(--color-ink)] hover:text-[var(--color-marigold)]">
              My Orders
            </Link>
          )}
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

      {categories.length > 0 && (
        <div className="border-t border-[var(--color-ink)]/5 bg-[var(--color-paper)]">
          <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-6 py-2 text-sm">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="whitespace-nowrap text-[var(--color-stone)] hover:text-[var(--color-marigold)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}