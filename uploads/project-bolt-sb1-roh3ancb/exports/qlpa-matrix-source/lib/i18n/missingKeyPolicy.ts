/**
 * Missing Key Policy
 * Defines how the i18n system handles missing translation keys.
 *
 * Policy:
 * - Missing keys fall back to the English (en) value.
 * - If the key is missing in en too, the key path itself is returned.
 * - Missing key warnings are only logged in Developer interface depth.
 * - Production builds should never show raw key paths to users.
 */

export type MissingKeyBehavior = 'fallback_en' | 'return_key' | 'empty_string';

export interface MissingKeyPolicy {
  behavior: MissingKeyBehavior;
  warnInDeveloperMode: boolean;
  warnInConsole: boolean;
  reportToStats: boolean;
}

/** The active policy — conservative fallback, warns in dev mode only */
export const MISSING_KEY_POLICY: MissingKeyPolicy = {
  behavior: 'fallback_en',
  warnInDeveloperMode: true,
  warnInConsole: false, // avoid console noise in production
  reportToStats: false, // do not create stats traffic for missing keys
};

/**
 * Log a missing key warning according to the policy.
 * Only fires if developer mode is active.
 */
export function reportMissingKey(
  key: string,
  locale: string,
  isDeveloperMode: boolean,
): void {
  if (!MISSING_KEY_POLICY.warnInDeveloperMode || !isDeveloperMode) return;
  if (MISSING_KEY_POLICY.warnInConsole) {
    console.warn(`[i18n] Missing key "${key}" for locale "${locale}" — falling back to English.`);
  }
}
