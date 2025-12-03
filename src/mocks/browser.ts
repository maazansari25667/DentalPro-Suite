import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Initialize worker only in browser environment
let worker: ReturnType<typeof setupWorker> | null = null;

// Start the worker in development
export async function enableMocking() {
  if (typeof window === 'undefined') {
    // We're on the server, don't start MSW
    return;
  }

  // Only start MSW in development - NEVER in production
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MSW_ENABLED !== 'false') {
    try {
      // Create worker only when needed
      if (!worker) {
        worker = setupWorker(...handlers);
      }
      
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      });
      console.log('🔶 MSW Service Worker started successfully');
    } catch (error) {
      console.error('❌ Failed to start MSW Service Worker:', error);
    }
  }
}

// Export worker for additional configuration if needed
export function getMswWorker() {
  return worker;
}