'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';

type State = 'loading' | 'error';

// Error codes that Supabase appends to the redirect URL as query params
const ERROR_MESSAGES: Record<string, string> = {
  otp_expired: 'This sign-in link has expired. Please request a new one.',
  access_denied: 'Access was denied. Please request a new sign-in link.',
};

function getUrlError(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('error_code') ?? params.get('error');
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const desc = params.get('error_description');
  if (desc) return decodeURIComponent(desc.replace(/\+/g, ' '));
  return null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for error params in the URL first (Supabase appends these on failure)
    const urlError = getUrlError();
    if (urlError) {
      setErrorMessage(urlError);
      setState('error');
      return;
    }

    // Supabase exchanges the hash fragment for a session automatically when the
    // page loads. We poll getSession() briefly to wait for that exchange to complete.
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // 20 × 300ms = 6 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          clearInterval(interval);
          setErrorMessage(error.message);
          setState('error');
          return;
        }

        if (data.session) {
          clearInterval(interval);
          router.replace('/messaging');
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setErrorMessage(
            'No session found after sign-in. The magic link may have expired or already been used. Please request a new link.'
          );
          setState('error');
        }
      } catch {
        clearInterval(interval);
        setErrorMessage('An unexpected error occurred. Please try again.');
        setState('error');
      }
    }, 300);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">

        {state === 'loading' && (
          <>
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-foreground">Connecting EarthID…</h1>
              <p className="text-sm text-muted-foreground">
                Establishing your secure session. This takes just a moment.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local messages remain safe on this device</span>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-foreground">Sign-in failed</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {errorMessage || 'Magic link expired or invalid. Please request a new link.'}
              </p>
            </div>
            <div className="space-y-3">
              <a
                href="/messaging"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
                  bg-primary text-primary-foreground text-sm font-medium
                  hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Back to Messaging
              </a>
              <p className="text-xs text-muted-foreground">
                You can request a new sign-in link from the Auth &amp; Sync QA panel.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
