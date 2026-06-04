'use client';

// Re-export everything from context so existing imports keep working.
// Components that call useT() will now share locale state via I18nProvider.
export {
  I18nProvider,
  useI18n as useT,
  loadLocale,
  saveLocale,
  DICTIONARIES,
} from './context';

export type { Locale, TranslationKey } from './context';
