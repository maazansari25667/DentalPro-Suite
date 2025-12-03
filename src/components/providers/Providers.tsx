'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { startMockSocket } from '@/lib/mockSocket';
import { enableMocking } from '@/mocks/browser';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  const [isMswReady, setIsMswReady] = useState(false);

  useEffect(() => {
    // Initialize MSW and start mock socket
    const initializeMsw = async () => {
      // Only enable mocking in development mode, never in production
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MSW_ENABLED !== 'false') {
        try {
          await enableMocking();
          setIsMswReady(true);
          
          // Start mock socket after MSW is ready
          startMockSocket(queryClient);
        } catch (error) {
          console.error('Failed to initialize MSW:', error);
          setIsMswReady(true); // Continue anyway
        }
      } else {
        setIsMswReady(true);
      }
    };

    initializeMsw();
  }, [queryClient]);

  // Show loading state while MSW initializes
  if (!isMswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}