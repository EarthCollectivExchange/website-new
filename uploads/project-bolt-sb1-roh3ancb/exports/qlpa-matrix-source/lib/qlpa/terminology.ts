/**
 * QLPA Terminology Registry
 * Canonical mapping of discouraged terms to QLPA-aligned replacements.
 * Extends the base languageProtocol.ts with richer metadata.
 */

export type TermSeverity = 'mild' | 'moderate' | 'severe';

export interface QlpaTerm {
  discouraged: string;
  replacement: string;
  reason: string;
  severity: TermSeverity;
  context?: string;
}

export const QLPA_TERMS: QlpaTerm[] = [
  // Fear-based action terms
  { discouraged: 'panic',           replacement: 'shield',                severity: 'severe',   reason: 'Induces fear response' },
  { discouraged: 'danger',          replacement: 'sensitive action',       severity: 'moderate', reason: 'Creates unnecessary alarm' },
  { discouraged: 'threat',          replacement: 'new access noticed',     severity: 'moderate', reason: 'Military/police framing' },
  { discouraged: 'kill',            replacement: 'seal',                   severity: 'severe',   reason: 'Violent language' },
  { discouraged: 'wipe',            replacement: 'clear local content',    severity: 'moderate', reason: 'Destructive framing' },
  { discouraged: 'self-destruct',   replacement: 'auto-clear',             severity: 'severe',   reason: 'Violent/destructive framing' },
  { discouraged: 'emergency',       replacement: 'shield',                 severity: 'moderate', reason: 'Creates urgency and panic', context: 'mode names only' },
  { discouraged: 'failed',          replacement: 'not completed yet',      severity: 'mild',     reason: 'Implies user failure' },
  { discouraged: 'blocked',         replacement: 'paused',                 severity: 'mild',     reason: 'Punitive framing', context: 'delivery states' },
  { discouraged: 'suspicious',      replacement: 'new activity noticed',   severity: 'moderate', reason: 'Accusatory framing' },
  { discouraged: 'delete forever',  replacement: 'clear from this device', severity: 'severe',   reason: 'Overclaims permanence + violent framing' },
  { discouraged: 'permanently',     replacement: 'from this device',       severity: 'moderate', reason: 'Often overclaims remote deletion' },
  { discouraged: 'erase',           replacement: 'clear',                  severity: 'mild',     reason: 'More violent than necessary' },
  { discouraged: 'warning',         replacement: 'important note',         severity: 'mild',     reason: 'Alarm framing for routine information' },
  { discouraged: 'invalid',         replacement: 'not ready yet',          severity: 'mild',     reason: 'Technical judgment framing' },
  { discouraged: 'error',           replacement: 'needs attention',        severity: 'mild',     reason: 'Alarm framing for recoverable states', context: 'user-facing messages only' },
  { discouraged: 'abort',           replacement: 'cancel',                 severity: 'moderate', reason: 'Violent/surgical framing' },
  { discouraged: 'destroy',         replacement: 'clear',                  severity: 'severe',   reason: 'Violent language' },
  { discouraged: 'force',           replacement: 'apply',                  severity: 'mild',     reason: 'Coercive framing' },
];

export function getTermReplacement(discouraged: string): string | undefined {
  const lower = discouraged.toLowerCase();
  return QLPA_TERMS.find((t) => t.discouraged.toLowerCase() === lower)?.replacement;
}

export function isDiscouragedTerm(term: string): boolean {
  const lower = term.toLowerCase();
  return QLPA_TERMS.some((t) => t.discouraged.toLowerCase() === lower);
}

export function getTermsBySeverity(severity: TermSeverity): QlpaTerm[] {
  return QLPA_TERMS.filter((t) => t.severity === severity);
}
