// ─── QLPA Language Suggestion Engine ─────────────────────────────────────────
//
// Provides gentle rewrite suggestions for common pressure/harm patterns.
// Rules:
//   - Suggestions are NEVER auto-applied. User chooses.
//   - Suggestions use i18n keys — no hardcoded display strings.
//   - No AI server calls. No network. Fully local and deterministic.
//   - If no suggestion applies, returns an empty array.

// ─── Suggestion entry ─────────────────────────────────────────────────────────

export interface LanguageSuggestion {
  /** i18n key for the suggestion label shown in the UI. */
  labelKey: string;
  /** i18n key for the suggestion text body. */
  suggestionKey: string;
  /** The pattern that triggered this suggestion (for debugging / tests). */
  triggerPattern: string;
}

// ─── Pattern → suggestion map ─────────────────────────────────────────────────
//
// Patterns are matched against the lowercased message text.
// Multiple patterns can match; all suggestions are returned.

interface SuggestionRule {
  pattern: RegExp;
  triggerPattern: string;
  labelKey: string;
  suggestionKey: string;
}

const SUGGESTION_RULES: readonly SuggestionRule[] = [
  // ── Original 7 pressure/blame patterns ──────────────────────────────────────
  {
    pattern: /\byou never\b/i,
    triggerPattern: 'you never',
    labelKey: 'languageHarmony.possibleBlame',
    suggestionKey: 'languageHarmony.suggestionFeelUnheard',
  },
  {
    pattern: /\byou always\b/i,
    triggerPattern: 'you always',
    labelKey: 'languageHarmony.possibleBlame',
    suggestionKey: 'languageHarmony.suggestionFeelUnheard',
  },
  {
    pattern: /\bdo (this|it) now\b/i,
    triggerPattern: 'do this now',
    labelKey: 'languageHarmony.heavyUrgency',
    suggestionKey: 'languageHarmony.suggestionPrioritize',
  },
  {
    pattern: /\byou must\b/i,
    triggerPattern: 'you must',
    labelKey: 'languageHarmony.possiblePressure',
    suggestionKey: 'languageHarmony.suggestionPrioritize',
  },
  {
    pattern: /\bif you cared\b/i,
    triggerPattern: 'if you cared',
    labelKey: 'languageHarmony.possiblePressure',
    suggestionKey: 'languageHarmony.suggestionOpenRequest',
  },
  {
    pattern: /\byou (have )?failed\b/i,
    triggerPattern: 'you failed',
    labelKey: 'languageHarmony.possibleBlame',
    suggestionKey: 'languageHarmony.suggestionFeelUnheard',
  },
  {
    pattern: /\bthat'?s wrong\b/i,
    triggerPattern: "that's wrong",
    labelKey: 'languageHarmony.possibleBlame',
    suggestionKey: 'languageHarmony.suggestionDifferentView',
  },

  // ── Pass 136: Profanity + frustration ────────────────────────────────────────
  {
    pattern: /\b(shit|fuck|bullshit|damn)\b.{0,40}\b(frustrated?|upset|angry|annoyed|mad)\b/i,
    triggerPattern: 'profanity + frustration',
    labelKey: 'languageHarmony.reason.profanityDetected',
    suggestionKey: 'languageHarmony.suggestionFrustratedMoment',
  },
  {
    pattern: /\b(frustrated?|upset|angry|annoyed|mad)\b.{0,40}\b(shit|fuck|bullshit|damn)\b/i,
    triggerPattern: 'frustration + profanity',
    labelKey: 'languageHarmony.reason.emotionalIntensity',
    suggestionKey: 'languageHarmony.suggestionFrustratedMoment',
  },

  // ── Pass 136: Direct attack ──────────────────────────────────────────────────
  {
    pattern: /\b(fuck|screw|go to hell)\s+(you|him|her|them|off)\b/i,
    triggerPattern: 'direct attack',
    labelKey: 'languageHarmony.reason.directAttack',
    suggestionKey: 'languageHarmony.suggestionUnderstandEachOther',
  },
  {
    pattern: /\b(worthless|pathetic|useless)\b/i,
    triggerPattern: 'direct insult',
    labelKey: 'languageHarmony.reason.directAttack',
    suggestionKey: 'languageHarmony.suggestionUnderstandEachOther',
  },

  // ── Pass 136: Pressure / blame ───────────────────────────────────────────────
  {
    pattern: /\b(you (always|never)\s+(listen|do|care|help|understand))\b/i,
    triggerPattern: 'you always/never + action',
    labelKey: 'languageHarmony.reason.pressureLanguage',
    suggestionKey: 'languageHarmony.suggestionLookTogether',
  },
  {
    pattern: /\b(you (have to|need to)|you'd better|you better)\b/i,
    triggerPattern: 'you have to / you need to',
    labelKey: 'languageHarmony.reason.pressureLanguage',
    suggestionKey: 'languageHarmony.suggestionLookTogether',
  },

  // ── Pass 136: Urgency ────────────────────────────────────────────────────────
  {
    pattern: /\b(right now|immediately|do it now|hurry up|asap)\b/i,
    triggerPattern: 'urgency phrase',
    labelKey: 'languageHarmony.reason.pressureLanguage',
    suggestionKey: 'languageHarmony.suggestionPrioritizeWhenPossible',
  },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Return a deduplicated list of suggestion entries for the given text.
 * Returns empty array if no patterns match — no suggestion is a valid outcome.
 */
export function getSuggestionsForText(text: string): LanguageSuggestion[] {
  if (!text || text.trim().length === 0) return [];

  const seen = new Set<string>();
  const results: LanguageSuggestion[] = [];

  for (const rule of SUGGESTION_RULES) {
    if (rule.pattern.test(text)) {
      const key = rule.suggestionKey;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          labelKey: rule.labelKey,
          suggestionKey: rule.suggestionKey,
          triggerPattern: rule.triggerPattern,
        });
      }
    }
  }

  return results;
}

/**
 * Return all suggestion keys that apply to the given text.
 * Convenience wrapper for use in the Intention Mirror.
 */
export function getSuggestionKeys(text: string): string[] {
  return getSuggestionsForText(text).map((s) => s.suggestionKey);
}

/** All trigger pattern strings (for testing and documentation). */
export const ALL_SUGGESTION_TRIGGER_PATTERNS: readonly string[] = SUGGESTION_RULES.map(
  (r) => r.triggerPattern,
);
