/**
 * QLPA Guards
 * Runtime helpers for scanning text and enforcing QLPA language principles.
 * Used by dev tools and the check-qlpa-language script.
 */

import { DISCOURAGED_TERMS, TERM_REPLACEMENTS } from './languageProtocol';
import { QLPA_TERMS, type QlpaTerm } from './terminology';

export interface QlpaScanResult {
  found: boolean;
  matches: QlpaScanMatch[];
}

export interface QlpaScanMatch {
  term: string;
  replacement: string;
  position: number;
  severity: QlpaTerm['severity'];
}

/**
 * Scan a text string for discouraged QLPA terms.
 * Returns all matches with positions and suggested replacements.
 */
export function scanTextForQlpaTerms(text: string): QlpaScanResult {
  const matches: QlpaScanMatch[] = [];
  const lowerText = text.toLowerCase();

  for (const term of DISCOURAGED_TERMS) {
    const lowerTerm = term.toLowerCase();
    let pos = lowerText.indexOf(lowerTerm);
    while (pos !== -1) {
      const replacement = TERM_REPLACEMENTS[term] ?? getQlpaReplacement(term) ?? term;
      const qlpaTerm = QLPA_TERMS.find((t) => t.discouraged.toLowerCase() === lowerTerm);
      matches.push({
        term,
        replacement,
        position: pos,
        severity: qlpaTerm?.severity ?? 'mild',
      });
      pos = lowerText.indexOf(lowerTerm, pos + 1);
    }
  }

  return { found: matches.length > 0, matches };
}

/**
 * Get a QLPA-approved replacement for a term.
 * Checks both the language protocol replacements and the terminology registry.
 */
export function getQlpaReplacement(term: string): string | undefined {
  if (TERM_REPLACEMENTS[term]) return TERM_REPLACEMENTS[term];
  const lowerTerm = term.toLowerCase();
  return QLPA_TERMS.find((t) => t.discouraged.toLowerCase() === lowerTerm)?.replacement;
}

/**
 * Check if a term is explicitly discouraged by QLPA.
 */
export function isDiscouragedQlpaTerm(term: string): boolean {
  if (DISCOURAGED_TERMS.includes(term)) return true;
  const lowerTerm = term.toLowerCase();
  return QLPA_TERMS.some((t) => t.discouraged.toLowerCase() === lowerTerm);
}

/**
 * Apply QLPA replacements to a string.
 * Replaces known discouraged terms with approved alternatives.
 * Case-insensitive matching; preserves original casing style where possible.
 */
export function applyQlpaReplacements(text: string): string {
  let result = text;
  for (const [discouraged, replacement] of Object.entries(TERM_REPLACEMENTS)) {
    const regex = new RegExp(discouraged.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, replacement);
  }
  return result;
}
