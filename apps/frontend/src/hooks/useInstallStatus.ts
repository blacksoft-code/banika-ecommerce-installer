'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function useInstallStatus() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient<{ isInstalled: boolean }>('/install/status')
      .then((res) => setIsInstalled(res.isInstalled))
      .catch(() => setIsInstalled(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { isInstalled, isLoading };
}