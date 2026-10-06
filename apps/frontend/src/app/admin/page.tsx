'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  lowStockCount: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByDay: { date: string; total: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<Stats>('/orders/stats/summary')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[var(--color-stone)]">Loading…</p>;
  }

  if (!stats) {
    return <p className="text-[var(--color-stone)]">Could not load dashboard data.</p>;
  }

  const maxDay = Math.max(...stats.revenueByDay.map((d) => d.total), 1);

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-[var(--color-stone)]">
        A quick look at how the store is doing.
      </p>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} />
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Pending orders" value={String(stats.pendingOrders)} highlight />
        <StatCard
          label="Avg. order value"
          value={`৳${Math.round(stats.averageOrderValue).toLocaleString()}`}
        />
      </div>

      {stats.lowStockCount > 0 && (
        <p className="mt-6 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
          {stats.lowStockCount} product(s) are running low on stock (under 10 units).
        </p>
      )}

      {/* Revenue bar chart (last 7 days) */}
      <div className="mt-10">
        <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink)]">
          Revenue — last 7 days
        </h2>
        <div className="mt-4 flex items-end gap-3" style={{ height: 160 }}>
          {stats.revenueByDay.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full bg-[var(--color-marigold)]"
                  style={{
                    height: `${Math.max(4, (d.total / maxDay) * 100)}%`,
                  }}
                  title={`৳${d.total}`}
                />
              </div>
              <span className="text-xs text-[var(--color-stone)]">
                {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders by status */}
      <div className="mt-10">
        <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink)]">
          Orders by status
        </h2>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          {stats.ordersByStatus.map((s) => (
            <div key={s.status}>
              <p className="text-[var(--color-stone)]">{s.status}</p>
              <p className="mt-1 text-xl font-[var(--font-display)] text-[var(--color-ink)]">
                {s.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="border border-[var(--color-ink)]/10 p-4">
      <p className="text-xs text-[var(--color-stone)]">{label}</p>
      <p
        className={`mt-2 font-[var(--font-display)] text-2xl ${
          highlight ? 'text-[var(--color-marigold)]' : 'text-[var(--color-ink)]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}