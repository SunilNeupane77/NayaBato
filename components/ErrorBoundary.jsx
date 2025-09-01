'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorBoundary({ children }) {
  const router = useRouter();

  useEffect(() => {
    const handleError = (event) => {
      const error = event.error || event.reason;
      
      // Check for NextAuth CLIENT_FETCH_ERROR
      if (error?.message?.includes('Failed to fetch') || 
          error?.toString?.().includes('CLIENT_FETCH_ERROR')) {
        console.warn('NextAuth fetch error detected, redirecting to offline page');
        router.push('/offline');
      }
    };

    const handleUnhandledRejection = (event) => {
      handleError(event);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  return children;
}
