import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-ink)]/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-[var(--color-stone)] sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Banika. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="/about" className="hover:text-[var(--color-marigold)]">About</Link>
          <Link href="/contact" className="hover:text-[var(--color-marigold)]">Contact</Link>
          <Link href="/privacy-policy" className="hover:text-[var(--color-marigold)]">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--color-marigold)]">Terms</Link>
          <Link href="/refund-policy" className="hover:text-[var(--color-marigold)]">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}