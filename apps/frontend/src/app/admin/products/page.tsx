'use client';

import { useEffect, useState } from 'react';
import { adminFetch, uploadMedia } from '@/lib/admin-client';

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  isActive: boolean;
  categoryId: string;
  category: { name: string };
  images: string[];
};

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  categoryId: '',
  isActive: true,
  images: [] as string[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function loadAll() {
    setLoading(true);
    Promise.all([
      adminFetch<Product[]>('/products'),
      adminFetch<Category[]>('/categories'),
    ])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: '',
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      stock: String(p.stock),
      categoryId: p.categoryId,
      isActive: p.isActive,
      images: p.images ?? [],
    });
    setShowForm(true);
    setError('');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadMedia(file);
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${result.url}`;
      setForm({ ...form, images: [fullUrl] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        stock: Number(form.stock),
        categoryId: form.categoryId,
        isActive: form.isActive,
        images: form.images,
      };

      if (editingId) {
        await adminFetch(`/products/${editingId}`, { method: 'PATCH', body });
      } else {
        await adminFetch('/products', { method: 'POST', body });
      }

      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    await adminFetch(`/products/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const inputClass =
    'mt-1 w-full border-b border-[var(--color-ink)]/20 bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-marigold)]';
  const labelClass = 'text-xs text-[var(--color-stone)]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink)]">
          Products
        </h1>
        <button
          onClick={openCreate}
          className="bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)]"
        >
          + Add product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-2 gap-4 border border-[var(--color-ink)]/10 p-6"
        >
          <h2 className="col-span-2 font-[var(--font-display)] text-lg">
            {editingId ? 'Edit product' : 'New product'}
          </h2>

          {error && (
            <p className="col-span-2 border-l-2 border-[var(--color-clay)] pl-3 text-sm text-[var(--color-clay)]">
              {error}
            </p>
          )}

          <div>
            <label className={labelClass}>Name</label>
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              required
              className={inputClass}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              required
              className={inputClass}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Discount price (optional)</label>
            <input
              type="number"
              className={inputClass}
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input
              type="number"
              required
              className={inputClass}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              required
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Product image</label>
            <div className="mt-1 flex items-center gap-4">
              {form.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.images[0]}
                  alt="Preview"
                  className="h-16 w-16 object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="text-sm"
              />
            </div>
            {uploading && (
              <p className="mt-1 text-xs text-[var(--color-stone)]">Uploading…</p>
            )}
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Description (optional)</label>
            <textarea
              rows={2}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active (visible in store)
          </label>

          <div className="col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-[var(--color-ink)] px-5 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-marigold)] hover:text-[var(--color-ink)] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-[var(--color-stone)] underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-8">
        {loading ? (
          <p className="text-[var(--color-stone)]">Loading…</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/10 text-[var(--color-stone)]">
                <th className="py-2 font-normal">Name</th>
                <th className="py-2 font-normal">Category</th>
                <th className="py-2 font-normal">Price</th>
                <th className="py-2 font-normal">Stock</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink)]/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">{p.name}</td>
                  <td className="py-3 text-[var(--color-stone)]">{p.category.name}</td>
                  <td className="py-3 text-[var(--color-bazaar-green)]">
                    ৳{p.discountPrice ?? p.price}
                  </td>
                  <td className="py-3">{p.stock}</td>
                  <td className="py-3">
                    {p.isActive ? (
                      <span className="text-[var(--color-bazaar-green)]">Active</span>
                    ) : (
                      <span className="text-[var(--color-stone)]">Hidden</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-[var(--color-clay)] underline"
                    >
                      Delete
                    </button>
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