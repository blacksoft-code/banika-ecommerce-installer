const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function adminFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = localStorage.getItem('banika_token');

  const res = await fetch(`${API_URL}/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Something went wrong.');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const token = localStorage.getItem('banika_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Upload failed.');
  }

  return res.json();
}