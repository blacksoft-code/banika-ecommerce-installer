import { Navbar } from '@/components/Navbar';

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">
          About us
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--color-stone)]">
          We&apos;re a store built on trust and quality — bringing you everyday
          essentials with honest pricing and reliable service. This page can be
          customized from the admin dashboard.
        </p>
      </div>
    </div>
  );
}