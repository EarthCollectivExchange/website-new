/**
 * Locale Registry
 * Canonical registry of all supported and future-planned locales.
 * Active locales have JSON files. Future locales are scaffolded here only.
 */

export type LocaleStatus = 'active' | 'scaffold' | 'future';

export interface LocaleEntry {
  code: string;
  nativeName: string;
  englishName: string;
  rtl: boolean;
  status: LocaleStatus;
  flag: string;
}

export const LOCALE_REGISTRY: LocaleEntry[] = [
  // ─── Active locales (JSON files exist) ────────────────────────────────────
  { code: 'en', nativeName: 'English',    englishName: 'English',    rtl: false, status: 'active',  flag: '🇬🇧' },
  { code: 'fr', nativeName: 'Français',   englishName: 'French',     rtl: false, status: 'active',  flag: '🇫🇷' },
  { code: 'id', nativeName: 'Indonesia',  englishName: 'Indonesian', rtl: false, status: 'active',  flag: '🇮🇩' },
  { code: 'es', nativeName: 'Español',    englishName: 'Spanish',    rtl: false, status: 'active',  flag: '🇪🇸' },
  { code: 'de', nativeName: 'Deutsch',    englishName: 'German',     rtl: false, status: 'active',  flag: '🇩🇪' },
  { code: 'it', nativeName: 'Italiano',   englishName: 'Italian',    rtl: false, status: 'active',  flag: '🇮🇹' },
  { code: 'pt', nativeName: 'Português',  englishName: 'Portuguese', rtl: false, status: 'active',  flag: '🇧🇷' },

  // ─── Future locales (scaffold — no JSON files yet) ─────────────────────────
  { code: 'ar', nativeName: 'العربية',    englishName: 'Arabic',     rtl: true,  status: 'future',  flag: '🇸🇦' },
  { code: 'hi', nativeName: 'हिन्दी',       englishName: 'Hindi',      rtl: false, status: 'future',  flag: '🇮🇳' },
  { code: 'zh', nativeName: '中文',         englishName: 'Chinese',    rtl: false, status: 'future',  flag: '🇨🇳' },
  { code: 'ja', nativeName: '日本語',       englishName: 'Japanese',   rtl: false, status: 'future',  flag: '🇯🇵' },
  { code: 'sw', nativeName: 'Kiswahili',   englishName: 'Swahili',    rtl: false, status: 'future',  flag: '🇰🇪' },
  { code: 'th', nativeName: 'ภาษาไทย',    englishName: 'Thai',       rtl: false, status: 'future',  flag: '🇹🇭' },
  { code: 'ru', nativeName: 'Русский',    englishName: 'Russian',    rtl: false, status: 'future',  flag: '🇷🇺' },
];

const REGISTRY_MAP = new Map(LOCALE_REGISTRY.map((l) => [l.code, l]));

export function getLocaleEntry(code: string): LocaleEntry | undefined {
  return REGISTRY_MAP.get(code);
}

export function getActiveLocales(): LocaleEntry[] {
  return LOCALE_REGISTRY.filter((l) => l.status === 'active');
}

export function getFutureLocales(): LocaleEntry[] {
  return LOCALE_REGISTRY.filter((l) => l.status === 'future');
}

export function isRtlLocale(code: string): boolean {
  return REGISTRY_MAP.get(code)?.rtl ?? false;
}

export function isActiveLocale(code: string): boolean {
  return REGISTRY_MAP.get(code)?.status === 'active';
}
