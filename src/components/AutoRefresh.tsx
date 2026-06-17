"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefresh({ intervalMs = 300000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Automatically refresh the current route data every intervalMs (default 5 minutes)
    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}
