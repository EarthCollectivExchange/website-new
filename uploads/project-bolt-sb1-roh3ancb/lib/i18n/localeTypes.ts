/**
 * Locale Types
 * Derived types for active locales.
 * Import ActiveLocale when you need the strict active-only union type.
 */

export type ActiveLocale = 'en' | 'fr' | 'id' | 'es' | 'de' | 'it' | 'pt';

export type FutureLocale = 'ar' | 'hi' | 'zh' | 'ja' | 'sw' | 'th' | 'ru';

export type AnyLocale = ActiveLocale | FutureLocale;

/**
 * Stable technical terms that should not be translated in any locale.
 * Pass-through strings — translators should leave these unchanged.
 */
export const STABLE_TERMS: readonly string[] = [
  'EarthOS',
  'EarthID',
  'QLPA',
  'AES-GCM-256',
  'AES-GCM',
  'MVP',
  'QA',
  'QLPA Net Shield',
  'Shield Mode',
] as const;

export function isStableTerm(term: string): boolean {
  return (STABLE_TERMS as readonly string[]).includes(term);
}
