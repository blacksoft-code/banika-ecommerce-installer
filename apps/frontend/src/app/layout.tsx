import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Banika Store",
  description: "Your online store",
};

type ActiveTheme = {
  name: string;
  config: { primaryColor?: string; accentColor?: string } | null;
} | null;

async function getActiveTheme(): Promise<ActiveTheme> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/themes/active`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    // Backend অফলাইন থাকলেও site যেন ভেঙে না পড়ে, ডিফল্ট রঙেই render হবে
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await getActiveTheme();
  const primaryColor = activeTheme?.config?.primaryColor;
  const accentColor = activeTheme?.config?.accentColor;

  return (
    <html lang="en">
      <head>
        {(primaryColor || accentColor) && (
          <style
            dangerouslySetInnerHTML={{
              __html: `:root {
                ${primaryColor ? `--color-ink: ${primaryColor};` : ""}
                ${accentColor ? `--color-marigold: ${accentColor};` : ""}
              }`,
            }}
          />
        )}
      </head>
      <body className={`${display.variable} ${body.variable} flex min-h-screen flex-col`}>
  <AuthProvider>
    <div className="flex-1">{children}</div>
    <Footer />
  </AuthProvider>
</body>
    </html>
  );
}