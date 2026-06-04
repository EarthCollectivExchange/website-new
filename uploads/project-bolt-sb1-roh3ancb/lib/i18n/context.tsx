'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type Locale, type TranslationKey, DICTIONARIES, loadLocale, saveLocale, translate } from './dictionary';

export type { Locale, TranslationKey };
export { loadLocale, saveLocale, DICTIONARIES };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey | string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with 'en' for SSR safety (server always renders English).
  // The inline <script> in app/layout.tsx writes the stored locale to
  // document.documentElement.dataset.locale before React hydrates.
  // We read it synchronously in useState initializer so the first client
  // render uses the correct locale, eliminating the visible English flash.
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof document === 'undefined') return 'en';
    const preloaded = document.documentElement.dataset.locale as Locale | undefined;
    if (preloaded && preloaded in DICTIONARIES) return preloaded;
    return 'en';
  });

  useEffect(() => {
    const stored = loadLocale();
    if (stored !== locale) setLocaleState(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    saveLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string) => translate(DICTIONARIES[locale], key),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
