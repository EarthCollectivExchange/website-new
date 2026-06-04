/**
 * EarthOS Application Constants
 * Stable identifiers, storage keys, version markers.
 * Import from here rather than hardcoding strings throughout the app.
 */

export const APP_NAME = 'EarthOS Messaging';
export const APP_VERSION = '0.1.0';
export const APP_MATURITY = 'local-first prototype';

// LocalStorage key namespace
export const STORAGE_NAMESPACE = 'earthos';

export const STORAGE_KEYS = {
  locale:               `${STORAGE_NAMESPACE}.locale`,
  humanMode:            `${STORAGE_NAMESPACE}.human_mode`,
  interfaceDepth:       `${STORAGE_NAMESPACE}.interface_depth`,
  appMode:              `${STORAGE_NAMESPACE}.app_mode`,
  statsMode:            `${STORAGE_NAMESPACE}.stats_mode`,
  backgroundMode:       `${STORAGE_NAMESPACE}.background_mode`,
  reducedMotion:        `${STORAGE_NAMESPACE}.reduced_motion`,
  compactMode:          `${STORAGE_NAMESPACE}.compact_mode`,
  developerDiagnostics: `${STORAGE_NAMESPACE}.developer_diagnostics`,
  languageHarmonyMode:  `${STORAGE_NAMESPACE}.language_harmony_mode`,
  localStore:           `${STORAGE_NAMESPACE}.local_store`,
  viewLevel:            `${STORAGE_NAMESPACE}.view_level`, // legacy key — migrate on read
} as const;

// Technical terms that are stable across all locales — do not translate
export const STABLE_TECHNICAL_TERMS = [
  'EarthOS',
  'EarthID',
  'QLPA',
  'AES-GCM-256',
  'AES-GCM',
  'MVP',
  'QA',
] as const;

// Rate limits (mirrors safety.ts logic)
export const RATE_LIMITS = {
  maxMessagesPerHourUnknown: 3,
  maxEmergencySignalsPerDay: 2,
} as const;

// Default preferences
export const PREFERENCE_DEFAULTS = {
  locale:               'en',
  humanMode:            'calm',
  interfaceDepth:       'simple',
  appMode:              'local_first',
  statsMode:            'light',
  backgroundMode:       'earth_alive',
  reducedMotion:        false,
  compactMode:          false,
  developerDiagnostics: false,
  languageHarmonyMode:  'soft',
} as const;
