'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  shippingPhone: string;
  createdAt: string;
  user: { name: string; email: string };
};

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    adminFetch<Order[]>('/orders').then(setOrders).finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await adminFetch(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
      loadAll();
    } finally {
      setUpdatingId(null);
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-[var(--color-stone)]',
    PROCESSING: 'text-[var(--color-marigold)]',
    SHIPPED: 'text-[var(--color-marigold)]',
    DELIVERED: 'text-[var(--color-bazaar-green)]',
    CANCELLED: 'text-[var(--color-clay)]',
  };

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
        Orders
      </h1>

      <div className="mt-8">
        {loading ? (
          <p className="text-[var(--color-stone)]">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-[var(--color-stone)]">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/10 text-[var(--color-stone)]">
                <th className="py-2 font-normal">Order</th>
                <th className="py-2 font-normal">Customer</th>
                <th className="py-2 font-normal">Total</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink)]/10">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3">{o.orderNumber}</td>
                  <td className="py-3 text-[var(--color-stone)]">{o.user.name}</td>
                  <td className="py-3">৳{o.totalAmount}</td>
                  <td className={`py-3 font-medium ${statusColor[o.status]}`}>
                    {o.status}
                  </td>
                  <td className="py-3">
                    <select
                      disabled={updatingId === o.id || o.status === 'CANCELLED'}
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border-b border-[var(--color-ink)]/20 bg-transparent py-1 text-sm outline-none focus:border-[var(--color-marigold)]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}