'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  images: string[];
  stock: number;
  category: { name: string };
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useAuth();
  const [wishlistMsg, setWishlistMsg] = useState('');

  useEffect(() => {
    // backend-এ slug দিয়ে না, id দিয়ে lookup হয় — তাই সব প্রোডাক্ট এনে slug মিলিয়ে বের করছি
    apiClient<Product[]>('/products')
      .then((products) => {
        const found = products.find((p) => p.slug === params.slug);
        if (found) setProduct(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [params.slug]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    setMessage('');
    try {
      const guestToken = localStorage.getItem('banika_guest_token');
      const token = localStorage.getItem('banika_token');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(guestToken ? { 'x-guest-token': guestToken } : {}),
          },
          body: JSON.stringify({ productId: product.id, quantity }),
        },
      );

      const newGuestToken = res.headers.get('x-guest-token');
      if (newGuestToken) {
        localStorage.setItem('banika_guest_token', newGuestToken);
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Could not add to cart.');
      }

      setMessage('Added to cart.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setAdding(false);
    }
  }

    async function handleAddToWishlist() {
    if (!product) return;
    if (!token) {
      setWishlistMsg('Please log in to save items.');
      return;
    }
    try {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${product.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setWishlistMsg('Saved to wishlist.');
    } catch (err) {
      setWishlistMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }


  if (notFound) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-[var(--color-stone)]">
            This product doesn&apos;t exist.{' '}
            <button onClick={() => router.push('/')} className="underline">
              Back to store
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-20 text-[var(--color-stone)]">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-14 lg:grid-cols-2">
        <div className="aspect-square bg-[var(--color-ink)]/5">
          {product.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div>
          <p className="text-sm text-[var(--color-stone)]">{product.category.name}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
            {product.name}
          </h1>

          <p className="mt-4 text-xl text-[var(--color-bazaar-green)]">
            ৳{product.discountPrice ?? product.price}
            {product.discountPrice && (
              <span className="ml-3 text-base text-[var(--color-stone)] line-through">
                ৳{product.price}
              </span>
            )}
          </p>

          {product.description && (
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--color-stone)]">
              {product.description}
            </p>
          )}

          <p className="mt-6 text-sm text-[var(--color-stone)]">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 border-b border-[var(--color-ink)]/20 bg-transparent py-2 text-sm outline-none focus:border-[var(--color-marigold)]"
              />
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add to cart'}
              </button>

              <button
                onClick={handleAddToWishlist}
                className="mt-3 text-sm text-[var(--color-ink)] underline underline-offset-4"
              >
                Save for later
              </button>
              {wishlistMsg && (
                <p className="mt-2 text-sm text-[var(--color-stone)]">{wishlistMsg}</p>
              )}
            </div>
          )}

          {message && (
            <p className="mt-4 text-sm text-[var(--color-bazaar-green)]">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}