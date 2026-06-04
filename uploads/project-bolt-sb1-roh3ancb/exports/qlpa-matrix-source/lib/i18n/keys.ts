/**
 * i18n Key Registry
 * Documents the canonical namespaces and key conventions used in en.json.
 *
 * This file does NOT contain translations — it contains documentation
 * about the key structure so contributors and tools can navigate the system.
 *
 * Key conventions:
 *   - namespace.key          → single-level string
 *   - namespace.subKey       → camelCase sub-key
 *   - {placeholder}          → runtime replacement via .replace('{placeholder}', value)
 *   - Stable terms           → EarthOS, EarthID, QLPA, AES-GCM-256 — never translate
 */

export const KEY_NAMESPACES = {
  nav:             'Bottom navigation tabs',
  modes:           'Human mode labels and descriptions',
  settings:        'Settings tab strings',
  dashboard:       'App dashboard panel strings',
  composer:        'Message composer strings',
  conversation:    'Conversation list and view strings',
  privacy:         'Privacy panel strings',
  delivery:        'Delivery status strings (simple/advanced/developer)',
  trust:           'Trust level and relationship strings',
  messages:        'Individual message action strings',
  onboarding:      'First-run experience strings',
  retention:       'Auto-clear timer strings',
  files:           'File transfer strings',
  voice:           'Voice memo strings',
  errors:          'Error state strings',
  common:          'Shared action strings (cancel, save, back, etc.)',
  banner:          'App-level notification banners',
  emptyState:      'Empty state UI strings',
  badge:           'Status badge labels (storage, trust)',
  syncStatus:      'Sync state indicator strings',
  invite:          'Invite member dialog strings',
  newConversation: 'New conversation drawer strings',
  mvp:             'MVP status panel strings',
  languages:       'Language name labels',
  status:          'Quick status strip labels',
  members:         'Members panel strings',
  sovereignty:     'Sovereignty/conversation settings panel strings',
} as const;

export type KeyNamespace = keyof typeof KEY_NAMESPACES;

/**
 * Runtime interpolation pattern.
 * The i18n system uses .replace('{key}', value) at the call site.
 *
 * Known placeholder patterns in en.json:
 *   {n}     — numeric count (e.g. "3 messages")
 *   {id}    — EarthID string
 *   {done}  — completed step count
 *   {steps} — step labels joined string
 */
export const INTERPOLATION_PLACEHOLDERS = ['{n}', '{id}', '{done}', '{steps}'] as const;
