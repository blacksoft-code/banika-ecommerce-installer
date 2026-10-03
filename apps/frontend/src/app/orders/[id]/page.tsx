'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  shippingPhone: string;
  items: { id: string; quantity: number; price: number; product: { name: string } }[];
};

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrder);
  }, [params.id, token]);

  if (!order) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20 text-[var(--color-stone)]">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--color-bazaar-green)]">Order confirmed</p>
        <h1 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          {order.orderNumber}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-stone)]">
          Status: {order.status}
        </p>

        <div className="mt-8 divide-y divide-[var(--color-ink)]/10 border-y border-[var(--color-ink)]/10 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <span>{item.product.name} × {item.quantity}</span>
              <span>৳{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-right text-sm font-medium">
          Total: ৳{order.totalAmount}
        </p>

        <Link
          href="/"
          className="mt-8 inline-block bg-[var(--color-ink)] px-6 py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}