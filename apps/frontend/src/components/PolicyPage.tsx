import { Navbar } from '@/components/Navbar';

export function PolicyPage({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          {title}
        </h1>
        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[var(--color-stone)]">
          {content}
        </p>
      </div>
    </div>
  );
}