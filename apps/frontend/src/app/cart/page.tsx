'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { cartClient, CartResponse } from '@/lib/cart-client';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    cartClient.get().then(setCart).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateQty(productId: string, quantity: number) {
    if (quantity < 1) return;
    setBusy(true);
    try {
      setCart(await cartClient.updateItem(productId, quantity));
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(productId: string) {
    setBusy(true);
    try {
      setCart(await cartClient.removeItem(productId));
    } finally {
      setBusy(false);
    }
  }

  async function applyCoupon() {
    if (!couponInput) return;
    setCouponError('');
    setBusy(true);
    try {
      setCart(await cartClient.applyCoupon(couponInput));
      setCouponInput('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon.');
    } finally {
      setBusy(false);
    }
  }

  async function removeCoupon() {
    setBusy(true);
    try {
      setCart(await cartClient.removeCoupon());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          Your cart
        </h1>

        {loading ? (
          <p className="mt-8 text-[var(--color-stone)]">Loading…</p>
        ) : !cart || cart.items.length === 0 ? (
          <p className="mt-8 text-[var(--color-stone)]">
            Your cart is empty.{' '}
            <Link href="/" className="underline">
              Continue shopping
            </Link>
            .
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
            {/* Items */}
            <div className="divide-y divide-[var(--color-ink)]/10">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5">
                  <div className="h-20 w-20 flex-shrink-0 bg-[var(--color-ink)]/5">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-ink)]">{item.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-bazaar-green)]">
                      ৳{item.unitPrice}
                    </p>

                    {item.priceChanged && (
                      <p className="mt-1 text-xs text-[var(--color-clay)]">
                        Price changed since you added this.
                      </p>
                    )}
                    {item.stockIssue && (
                      <p className="mt-1 text-xs text-[var(--color-clay)]">
                        Only {item.availableStock} left in stock.
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        disabled={busy}
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="h-7 w-7 border border-[var(--color-ink)]/20 text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        disabled={busy}
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="h-7 w-7 border border-[var(--color-ink)]/20 text-sm"
                      >
                        +
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => removeItem(item.productId)}
                        className="ml-4 text-xs text-[var(--color-clay)] underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-ink)]">৳{item.lineTotal}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="h-fit border border-[var(--color-ink)]/10 p-6">
              <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink)]">
                Order summary
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone)]">Subtotal</span>
                  <span>৳{cart.pricing.subtotal}</span>
                </div>
                {cart.pricing.couponDiscount > 0 && (
                  <div className="flex justify-between text-[var(--color-bazaar-green)]">
                    <span>Coupon ({cart.couponCode})</span>
                    <span>−৳{cart.pricing.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone)]">Shipping</span>
                  <span>৳{cart.pricing.shippingFee}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--color-ink)]/10 pt-2 font-medium">
                  <span>Total</span>
                  <span>৳{cart.pricing.total}</span>
                </div>
                {cart.pricing.youSave > 0 && (
                  <p className="text-xs text-[var(--color-bazaar-green)]">
                    You save ৳{cart.pricing.youSave}
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="mt-5 border-t border-[var(--color-ink)]/10 pt-5">
                {cart.couponCode ? (
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Applied: <strong>{cart.couponCode}</strong>
                    </span>
                    <button onClick={removeCoupon} className="text-xs text-[var(--color-clay)] underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={busy}
                        className="shrink-0 text-sm text-[var(--color-ink)] underline"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-xs text-[var(--color-clay)]">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/checkout')}
                disabled={busy || cart.flags.hasStockIssue}
                className="mt-6 w-full bg-[var(--color-ink)] py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                Checkout
              </button>
              {cart.flags.hasStockIssue && (
                <p className="mt-2 text-xs text-[var(--color-clay)]">
                  Resolve stock issues above before checking out.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}