const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string | null;
  unitPrice: number;
  priceAtAdd: number;
  priceChanged: boolean;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  stockIssue: boolean;
};

export type CartResponse = {
  cartId: string;
  status: string;
  guestToken?: string;
  couponCode: string | null;
  couponMessage?: string;
  items: CartItem[];
  itemCount: number;
  pricing: {
    originalTotal: number;
    subtotal: number;
    productDiscount: number;
    couponDiscount: number;
    discount: number;
    shippingFee: number;
    tax: number;
    total: number;
    youSave: number;
  };
  flags: {
    hasPriceChange: boolean;
    hasStockIssue: boolean;
    freeShipping: boolean;
  };
};

function getHeaders() {
  const token = localStorage.getItem('banika_token');
  const guestToken = localStorage.getItem('banika_guest_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (guestToken) headers['x-guest-token'] = guestToken;
  return headers;
}

async function cartFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers ?? {}) },
    cache: 'no-store',
  });

  const newGuestToken = res.headers.get('x-guest-token');
  if (newGuestToken) {
    localStorage.setItem('banika_guest_token', newGuestToken);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Something went wrong.');
  }
  return res.json();
}

export const cartClient = {
  get: (): Promise<CartResponse> => cartFetch('/cart'),

  addItem: (productId: string, quantity: number): Promise<CartResponse> =>
    cartFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (productId: string, quantity: number): Promise<CartResponse> =>
    cartFetch(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (productId: string): Promise<CartResponse> =>
    cartFetch(`/cart/items/${productId}`, { method: 'DELETE' }),

  applyCoupon: (code: string): Promise<CartResponse> =>
    cartFetch('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  removeCoupon: (): Promise<CartResponse> =>
    cartFetch('/cart/coupon', { method: 'DELETE' }),

    checkout: (data: {
    shippingAddress: string;
    shippingPhone: string;
    paymentMethod?: string;
  }) =>
    cartFetch('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};