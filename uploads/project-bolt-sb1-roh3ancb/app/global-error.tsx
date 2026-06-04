'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Catches errors thrown in the root layout (app/layout.tsx).
// Must include its own <html> and <body> tags.
export default function GlobalRootError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[EarthOS] Root layout error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0d1f1a', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            color: '#c8ddd7',
          }}
        >
          <div style={{ maxWidth: 360, width: '100%' }}>
            <p style={{ fontSize: 14, color: '#8ab5a8', lineHeight: 1.6, marginBottom: 24 }}>
              EarthOS encountered an error during startup. Your local data is safe.
            </p>
            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                background: '#1a3d30',
                color: '#c8ddd7',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {error.digest && (
              <p style={{ marginTop: 16, fontSize: 11, color: '#4a7a6c', fontFamily: 'monospace' }}>
                ref: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
