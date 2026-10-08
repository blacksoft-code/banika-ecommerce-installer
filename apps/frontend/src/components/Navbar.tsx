'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type StoreInfo = {
  businessName: string | null;
  businessLogo: string | null;
};

type Category = { id: string; name: string; slug: string };

type SuggestProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
};

type SuggestCategory = { id: string; name: string; slug: string };

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [query, setQuery] = useState('');
  const [suggestProducts, setSuggestProducts] = useState<SuggestProduct[]>([]);
  const [suggestCategories, setSuggestCategories] = useState<SuggestCategory[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

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

  // ---------------- Predictive search (debounced) ----------------
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestProducts([]);
      setSuggestCategories([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/suggest?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data: { products: SuggestProduct[]; categories: SuggestCategory[] }) => {
          setSuggestProducts(data.products);
          setSuggestCategories(data.categories);
          setShowDropdown(true);
        })
        .catch(() => {});
    }, 250); // ২৫০ms debounce — প্রতিটা key-stroke-এ API কল না করে, টাইপিং থামার পর কল করে

    return () => clearTimeout(timer);
  }, [query]);

  // বক্সের বাইরে ক্লিক করলে dropdown বন্ধ
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function goTo(path: string) {
    setShowDropdown(false);
    setQuery('');
    router.push(path);
  }

  const hasResults = suggestProducts.length > 0 || suggestCategories.length > 0;

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

        {/* Predictive search box */}
        <div ref={boxRef} className="relative hidden sm:block">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products or categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
              className="w-72 border-b border-[var(--color-ink)]/20 bg-transparent py-1 text-sm outline-none focus:border-[var(--color-marigold)]"
            />
          </form>

          {showDropdown && query.trim().length >= 2 && (
            <div className="absolute left-0 top-full z-20 mt-2 w-80 border border-[var(--color-ink)]/10 bg-[var(--color-paper)] shadow-sm">
              {!hasResults ? (
                <p className="px-4 py-3 text-sm text-[var(--color-stone)]">No matches found.</p>
              ) : (
                <>
                  {suggestCategories.length > 0 && (
                    <div className="border-b border-[var(--color-ink)]/10 py-2">
                      <p className="px-4 py-1 text-xs text-[var(--color-stone)]">Categories</p>
                      {suggestCategories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => goTo(`/category/${c.slug}`)}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-ink)]/5"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {suggestProducts.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 py-1 text-xs text-[var(--color-stone)]">Products</p>
                      {suggestProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => goTo(`/products/${p.slug}`)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[var(--color-ink)]/5"
                        >
                          <div className="h-10 w-10 flex-shrink-0 bg-[var(--color-ink)]/5">
                            {p.images[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <span className="flex-1 text-sm">{p.name}</span>
                          <span className="text-sm text-[var(--color-bazaar-green)]">
                            ৳{p.discountPrice ?? p.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => goTo(`/search?q=${encodeURIComponent(query.trim())}`)}
                    className="block w-full border-t border-[var(--color-ink)]/10 px-4 py-2 text-left text-sm text-[var(--color-marigold)] hover:bg-[var(--color-ink)]/5"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </button>
                </>
              )}
            </div>
          )}
        </div>

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