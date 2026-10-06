'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${params.slug}`)
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [params.slug]);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="font-[var(--font-display)] text-3xl capitalize text-[var(--color-ink)]">
          {params.slug.replace(/-/g, ' ')}
        </h1>

        {loading ? (
          <p className="mt-8 text-[var(--color-stone)]">Loading…</p>
        ) : products.length === 0 ? (
          <p className="mt-8 text-[var(--color-stone)]">No products in this category yet.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group">
                <div className="aspect-square bg-[var(--color-ink)]/5">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink)] group-hover:text-[var(--color-marigold)]">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-bazaar-green)]">
                  ৳{p.discountPrice ?? p.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}