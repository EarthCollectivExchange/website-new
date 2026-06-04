import en from './locales/en.json';
import fr from './locales/fr.json';
import id from './locales/id.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

export type Locale = 'en' | 'fr' | 'id' | 'es' | 'de' | 'it' | 'pt';

export const LOCALES: { code: Locale; nativeName: string; flag: string }[] = [
  { code: 'en', nativeName: 'English',    flag: '🇬🇧' },
  { code: 'fr', nativeName: 'Français',   flag: '🇫🇷' },
  { code: 'id', nativeName: 'Indonesia',  flag: '🇮🇩' },
  { code: 'es', nativeName: 'Español',    flag: '🇪🇸' },
  { code: 'de', nativeName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', nativeName: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', nativeName: 'Português',  flag: '🇧🇷' },
];

export const DICTIONARIES: Record<Locale, typeof en> = { en, fr, id, es, de, it, pt };

const LOCALE_KEY = 'earthos.locale';

export function loadLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
  if (stored && stored in DICTIONARIES) return stored;
  const browser = navigator.language.slice(0, 2) as Locale;
  return browser in DICTIONARIES ? browser : 'en';
}

export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_KEY, locale);
}

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

export function translate(dict: typeof en, key: string): string {
  const parts = key.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === 'string') return current;
  // Fallback to English
  let fallback: unknown = en;
  for (const part of parts) {
    if (fallback == null || typeof fallback !== 'object') return key;
    fallback = (fallback as Record<string, unknown>)[part];
  }
  return typeof fallback === 'string' ? fallback : key;
}
