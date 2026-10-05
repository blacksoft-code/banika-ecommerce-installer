'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  items: { id: string; quantity: number; price: number; product: { name: string; images: string[] } }[];
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-[var(--color-stone)]',
  PROCESSING: 'text-[var(--color-marigold)]',
  SHIPPED: 'text-[var(--color-marigold)]',
  DELIVERED: 'text-[var(--color-bazaar-green)]',
  CANCELLED: 'text-[var(--color-clay)]',
};

export default function OrderHistoryPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

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

  const [current, ...previous] = orders;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          Your orders
        </h1>

        {orders.length === 0 ? (
          <p className="mt-8 text-[var(--color-stone)]">
            You haven&apos;t placed any orders yet.{' '}
            <Link href="/" className="underline">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <>
            {/* Current / most recent order */}
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wide text-[var(--color-stone)]">
                Current order
              </p>
              <OrderCard order={current} />
            </div>

            {/* Previous orders */}
            {previous.length > 0 && (
              <div className="mt-10">
                <p className="text-xs uppercase tracking-wide text-[var(--color-stone)]">
                  Previous orders
                </p>
                <div className="mt-3 space-y-4">
                  {previous.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="mt-3 block border border-[var(--color-ink)]/10 p-5 transition hover:border-[var(--color-marigold)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {order.orderNumber}
          </p>
          <p className="mt-1 text-xs text-[var(--color-stone)]">
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <p className={`text-sm font-medium ${STATUS_COLOR[order.status] ?? ''}`}>
          {order.status}
        </p>
      </div>

      <div className="mt-4 space-y-1 text-sm text-[var(--color-stone)]">
        {order.items.map((item) => (
          <p key={item.id}>
            {item.product.name} × {item.quantity}
          </p>
        ))}
      </div>

      <p className="mt-4 text-right text-sm font-medium text-[var(--color-ink)]">
        Total: ৳{order.totalAmount}
      </p>
    </Link>
  );
}