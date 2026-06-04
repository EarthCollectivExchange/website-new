'use client';

import { I18nProvider } from '@/lib/i18n/context';
import { QLPARuntimeProvider } from '@/lib/qlpa/QLPARuntimeContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // QLPARuntimeProvider wraps I18nProvider so language is available inside
  // the runtime context tree. Device detection runs in useEffect — no SSR risk.
  return (
    <QLPARuntimeProvider>
      <I18nProvider>{children}</I18nProvider>
    </QLPARuntimeProvider>
  );
}
