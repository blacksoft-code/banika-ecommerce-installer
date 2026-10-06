'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { cartClient, CartResponse } from '@/lib/cart-client';

type ShippingMethod = { id: string; name: string; rate: number };

export default function CheckoutPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    shippingAddress: '',
    shippingPhone: '',
    paymentMethod: 'COD',
  });
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (token) {
      cartClient.get().then(setCart).finally(() => setLoading(false));
    }
  }, [token]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping-methods`)
      .then((res) => res.json())
      .then((data: ShippingMethod[]) => {
        setMethods(data);
        if (data.length > 0) setShippingMethodId(data[0].id);
      });
  }, []);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const order = await cartClient.checkout({ ...form, shippingMethodId });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order.');
    } finally {
      setPlacing(false);
    }
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

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-20 text-[var(--color-stone)]">
          Your cart is empty.
        </div>
      </div>
    );
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-sm text-[var(--color-stone)]';
  const shippingFee = methods.find((m) => m.id === shippingMethodId)?.rate ?? 0;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          Checkout
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          {/* Shipping form */}
          <form onSubmit={handlePlaceOrder} className="space-y-5">
            {error && (
              <p className="border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
                {error}
              </p>
            )}
            <div>
              <label className={labelClass}>Shipping address</label>
              <textarea
                required
                rows={3}
                className={inputClass}
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Phone number</label>
              <input
                type="text"
                required
                className={inputClass}
                value={form.shippingPhone}
                onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })}
              />
            </div>

            {methods.length > 0 && (
              <div>
                <label className={labelClass}>Shipping method</label>
                <select
                  className={inputClass}
                  value={shippingMethodId}
                  onChange={(e) => setShippingMethodId(e.target.value)}
                >
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — ৳{m.rate}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Payment method</label>
              <select
                className={inputClass}
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={placing || cart.flags.hasStockIssue}
              className="w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
            >
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </form>

          {/* Summary */}
          <div className="h-fit border border-[var(--color-ink)]/10 p-6">
            <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink)]">
              Order summary
            </h2>
            <div className="mt-4 space-y-2 divide-y divide-[var(--color-ink)]/10 text-sm">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>৳{item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-[var(--color-ink)]/10 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-stone)]">Subtotal</span>
                <span>৳{cart.pricing.subtotal}</span>
              </div>
              {cart.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-[var(--color-bazaar-green)]">
                  <span>Coupon</span>
                  <span>−৳{cart.pricing.couponDiscount}</span>
                </div>
              )}
              {shippingMethodId && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone)]">Shipping</span>
                  <span>৳{shippingFee}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>৳{cart.pricing.total + shippingFee}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}