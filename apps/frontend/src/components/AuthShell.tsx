import { ReactNode } from "react";

export function AuthShell({
  tagline,
  children,
}: {
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* বাম প্যানেল — ব্র্যান্ড */}
      <div className="hidden w-[38%] flex-col justify-between bg-[var(--color-ink)] px-12 py-14 text-[var(--color-paper)] lg:flex">
        <div>
          <p className="font-[var(--font-display)] text-2xl">Banika</p>
        </div>
        <p className="font-[var(--font-display)] text-3xl leading-snug text-[var(--color-paper)]/90">
          {tagline}
        </p>
        <p className="text-sm text-[var(--color-paper)]/50">
          Built for sellers, ready for customers.
        </p>
      </div>

      {/* ডান প্যানেল — কনটেন্ট */}
      <div className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}