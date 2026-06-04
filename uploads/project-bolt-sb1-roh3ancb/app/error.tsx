'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in dev — no external telemetry
    if (process.env.NODE_ENV !== 'production') {
      console.error('[EarthOS] Runtime error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1f1a] text-[#c8ddd7] px-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#1a3d30] flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#4a9e82]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-[#e0eeea]">
            Something went wrong
          </h1>
          <p className="text-sm text-[#8ab5a8] leading-relaxed">
            EarthOS Messaging encountered an unexpected error. Your local data is safe.
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full py-2.5 px-4 rounded-lg bg-[#1a3d30] hover:bg-[#234f3e] text-[#c8ddd7] text-sm font-medium transition-colors"
        >
          Try again
        </button>

        {error.digest && (
          <p className="text-xs text-[#4a7a6c] font-mono">
            ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
