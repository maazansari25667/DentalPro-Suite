'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto w-full max-w-[600px] text-center">
            <h1 className="mb-4 font-bold text-gray-800 text-6xl dark:text-white/90">
              500
            </h1>
            
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Something went wrong!
            </h2>

            <p className="mb-8 text-base text-gray-700 dark:text-gray-400">
              {process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'An unexpected error occurred. Please try again later.'}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Go Home
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && error.digest && (
              <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
                Error Digest: {error.digest}
              </p>
            )}
          </div>

          <p className="absolute text-sm text-center text-gray-500 bottom-6 dark:text-gray-400">
            &copy; {new Date().getFullYear()} - Wavenet Care
          </p>
        </div>
      </body>
    </html>
  )
}
