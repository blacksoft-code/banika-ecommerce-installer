'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';

type StoreInfo = {
  businessName: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessInfo: string | null;
};

export default function ContactPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`)
      .then((res) => res.json())
      .then(setStore)
      .catch(() => {});
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          Contact us
        </h1>
        {store?.businessInfo && (
          <p className="mt-4 text-sm text-[var(--color-stone)]">{store.businessInfo}</p>
        )}
        <div className="mt-8 space-y-2 text-sm">
          {store?.businessEmail && (
            <p>
              <span className="text-[var(--color-stone)]">Email: </span>
              {store.businessEmail}
            </p>
          )}
          {store?.businessPhone && (
            <p>
              <span className="text-[var(--color-stone)]">Phone: </span>
              {store.businessPhone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}