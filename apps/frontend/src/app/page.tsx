'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useInstallStatus } from '@/hooks/useInstallStatus';
import { Navbar } from '@/components/Navbar';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  stock: number;
};

export default function Home() {
  const { isInstalled, isLoading } = useInstallStatus();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!isLoading && isInstalled === false) {
      router.replace('/install');
    }
  }, [isLoading, isInstalled, router]);

  useEffect(() => {
    if (isInstalled) {
      apiClient<Product[]>('/products')
        .then(setProducts)
        .finally(() => setLoadingProducts(false));
    }
  }, [isInstalled]);

  if (isLoading || isInstalled === false) return null;

  return (
    <div>
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
          Everything for everyday.
        </h1>
        <p className="mt-2 max-w-md text-[var(--color-stone)]">
          Browse what&apos;s in stock today.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        {loadingProducts ? (
          <p className="text-[var(--color-stone)]">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-[var(--color-stone)]">
            No products yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group">
                <div className="aspect-square bg-[var(--color-ink)]/5" >
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink)] group-hover:text-[var(--color-marigold)]">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-bazaar-green)]">
                  ৳{p.discountPrice ?? p.price}
                  {p.discountPrice && (
                    <span className="ml-2 text-[var(--color-stone)] line-through">
                      ৳{p.price}
                    </span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}