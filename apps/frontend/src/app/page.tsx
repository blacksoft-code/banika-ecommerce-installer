'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInstallStatus } from '@/hooks/useInstallStatus';

export default function Home() {
  const { isInstalled, isLoading } = useInstallStatus();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isInstalled === false) {
      router.replace('/install');
    }
  }, [isLoading, isInstalled, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isInstalled === false) {
    return null; // redirect হচ্ছে, কিছু দেখানোর দরকার নেই
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">Welcome to Banika Store 🎉</h1>
    </div>
  );
}