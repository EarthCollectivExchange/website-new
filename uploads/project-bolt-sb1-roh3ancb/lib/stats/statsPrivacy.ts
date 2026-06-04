/**
 * Stats Privacy Guard
 * Enforces that no prohibited personal or content data enters the stats system.
 *
 * This module is the gatekeeper. Call validateStatsEvent() before recording any event.
 */

import type { StatsEvent } from './statsTypes';

// ─── Prohibited field names ───────────────────────────────────────────────────

const PROHIBITED_FIELD_PATTERNS: RegExp[] = [
  /body/i,
  /content/i,
  /plaintext/i,
  /privateKey/i,
  /secretKey/i,
  /password/i,
  /phone/i,
  /email/i,
  /contactName/i,
  /fileName/i,
  /displayName/i,
  /handle(?!r)/i, // "handle" but not "handler"
  /earthId/i,     // never store the actual EarthID value in stats
  /messageBody/i,
  /voiceContent/i,
  /fileContent/i,
];

// ─── Stats Event Validation ───────────────────────────────────────────────────

export interface StatsPrivacyValidation {
  valid: boolean;
  violations: string[];
}

/**
 * Validate a stats event for privacy compliance.
 * Checks the event object for any prohibited field patterns.
 */
export function validateStatsEvent(event: Partial<StatsEvent>): StatsPrivacyValidation {
  const violations: string[] = [];

  for (const key of Object.keys(event)) {
    if (PROHIBITED_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
      violations.push(`Prohibited field: "${key}"`);
    }
  }

  // Check that string values don't contain obvious personal data patterns
  for (const [key, value] of Object.entries(event)) {
    if (typeof value === 'string') {
      if (value.includes('@') && value.includes('.')) {
        violations.push(`Possible email in field "${key}"`);
      }
      if (/^eid-/.test(value)) {
        violations.push(`EarthID value found in field "${key}" — use a boolean or bucket instead`);
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Strip prohibited fields from an event before recording.
 * Returns a clean event or null if the event type itself is prohibited.
 */
export function sanitizeStatsEvent(event: Partial<StatsEvent>): Partial<StatsEvent> | null {
  const sanitized: Partial<StatsEvent> = {};

  for (const [key, value] of Object.entries(event)) {
    const isProhibited = PROHIBITED_FIELD_PATTERNS.some((pattern) => pattern.test(key));
    if (!isProhibited) {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

// ─── Privacy Notice ───────────────────────────────────────────────────────────

export const STATS_PRIVACY_NOTICE = {
  collects: [
    'Aggregate event counts (messages sent, conversations created)',
    'Mode and preference selections',
    'File size buckets (tiny/small/medium/large — not exact sizes)',
    'Locale code',
    'Success/failure booleans',
  ],
  neverCollects: [
    'Message content or body',
    'File names or file content',
    'Voice recordings',
    'Contact names, email, or phone numbers',
    'Private keys or cryptographic material',
    'EarthID identifiers',
    'Precise file sizes',
  ],
  storage: 'Local device only — never sent to any server',
  control: 'Stats can be disabled at any time in Settings → Developer',
} as const;
