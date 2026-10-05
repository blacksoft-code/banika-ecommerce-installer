'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { cartClient } from '@/lib/cart-client';

type WishlistItem = {
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    images: string[];
  };
};

export default function WishlistPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  function load() {
    if (!token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function remove(productId: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  async function moveToCart(productId: string) {
    await cartClient.addItem(productId, 1);
    await remove(productId);
  }

  if (isLoading || loading) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-20 text-[var(--color-stone)]">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          Saved for later
        </h1>

        {items.length === 0 ? (
          <p className="mt-8 text-[var(--color-stone)]">
            Nothing saved yet.{' '}
            <Link href="/" className="underline">
              Browse the store
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8 divide-y divide-[var(--color-ink)]/10">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-5">
                <Link href={`/products/${item.product.slug}`} className="h-20 w-20 flex-shrink-0 bg-[var(--color-ink)]/5">
                  {item.product.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="text-sm text-[var(--color-ink)]">
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--color-bazaar-green)]">
                    ৳{item.product.discountPrice ?? item.product.price}
                  </p>
                </div>
                <button
                  onClick={() => moveToCart(item.productId)}
                  className="text-sm text-[var(--color-ink)] underline"
                >
                  Move to cart
                </button>
                <button
                  onClick={() => remove(item.productId)}
                  className="text-sm text-[var(--color-clay)] underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}