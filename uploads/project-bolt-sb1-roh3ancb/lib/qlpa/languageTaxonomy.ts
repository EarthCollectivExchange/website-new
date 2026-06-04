// ─── QLPA Language Taxonomy ───────────────────────────────────────────────────
//
// Canonical vocabulary entries for the Language Harmony / Intention Mirror system.
// Internal name: Zero Negative Blueprint Energy Checker taxonomy.
//
// Design rules:
//   - All functions are pure. No I/O, no network, no React.
//   - Profanity alone does NOT block a message. Context decides severity.
//   - Normal emotional vocabulary does NOT escalate to 'hold' or 'block'.
//   - Shield escalation is reserved for child safety and sexual violence content.
//   - Terms are checked case-insensitively at all call sites.

import type { LanguageDimension } from './languageBlueprint';
import type { ReasonCode } from './intentionMirrorTypes';

// ─── Taxonomy categories ──────────────────────────────────────────────────────

export type TaxonomyCategory =
  | 'emotion'              // normal emotional vocabulary (anger, sadness, fear)
  | 'profanity'            // swear words — detected, not blocked alone
  | 'pressure'             // coercive / controlling language
  | 'insult'               // personal attacks and put-downs
  | 'threat'               // statements of intended harm
  | 'hate'                 // slurs and dehumanizing vocabulary
  | 'sexual'               // sexual content (adult, context-dependent)
  | 'nonConsensualSexual'  // non-consensual sexual content (Shield-linked)
  | 'childSafety'          // child exploitation vocabulary (Shield — critical)
  | 'scam'                 // financial manipulation patterns
  | 'botSpam'              // repetitive / bot-like patterns
  | 'selfHarm'             // self-harm vocabulary
  | 'doxxing'              // personal information exposure threats
  | 'manipulation';        // emotional manipulation patterns

export const ALL_TAXONOMY_CATEGORIES: readonly TaxonomyCategory[] = [
  'emotion', 'profanity', 'pressure', 'insult', 'threat', 'hate',
  'sexual', 'nonConsensualSexual', 'childSafety', 'scam', 'botSpam',
  'selfHarm', 'doxxing', 'manipulation',
];

// ─── Severity ─────────────────────────────────────────────────────────────────

export type TaxonomySeverity = 'low' | 'medium' | 'high' | 'critical';

// ─── Default action ───────────────────────────────────────────────────────────
//
// What the Intention Mirror does when this term is detected in isolation.
// Context patterns below may override this upward (never downward).

export type TaxonomyDefaultAction = 'detect' | 'reflect' | 'caution' | 'hold' | 'block';

// ─── Taxonomy entry ───────────────────────────────────────────────────────────

export interface TaxonomyEntry {
  term: string;
  category: TaxonomyCategory;
  severity: TaxonomySeverity;
  /** What the mirror does when this term appears alone, without context. */
  defaultAction: TaxonomyDefaultAction;
  /** True when context is needed to determine actual severity. */
  contextRequired: boolean;
  /** Reason code to attach to the analysis result. */
  reasonCode: ReasonCode;
}

// ─── Vocabulary terms ─────────────────────────────────────────────────────────

export const TAXONOMY_TERMS: readonly TaxonomyEntry[] = [
  // ── Emotion (normal vocabulary — detected only, never blocked) ──────────────
  { term: 'angry',     category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'anger',     category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'furious',   category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'fury',      category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'rage',      category: 'emotion', severity: 'low',    defaultAction: 'reflect', contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'raging',    category: 'emotion', severity: 'low',    defaultAction: 'reflect', contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'scared',    category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'anxious',   category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'frustrated',category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'upset',     category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'disgusted', category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'devastated',category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'miserable', category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'hopeless',  category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },
  { term: 'helpless',  category: 'emotion', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'emotional-intensity' },

  // ── Profanity (detected; alone = low severity, allow send) ──────────────────
  { term: 'shit',      category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'fuck',      category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'fucking',   category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'fucked',    category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'bullshit',  category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'damn',      category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'asshole',   category: 'profanity', severity: 'medium', defaultAction: 'reflect', contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'bitch',     category: 'profanity', severity: 'medium', defaultAction: 'reflect', contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'bastard',   category: 'profanity', severity: 'medium', defaultAction: 'reflect', contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'crap',      category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },
  { term: 'hell',      category: 'profanity', severity: 'low',    defaultAction: 'detect',  contextRequired: true, reasonCode: 'profanity-detected' },

  // ── Pressure (coercive / controlling) ────────────────────────────────────────
  { term: 'you must',      category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: 'you need to',   category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: 'you have to',   category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: "you'd better",  category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: 'you better',    category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: 'right now',     category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'heavy-urgency' },
  { term: 'immediately',   category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'heavy-urgency' },
  { term: 'do it now',     category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'heavy-urgency' },
  { term: 'hurry up',      category: 'pressure', severity: 'low',    defaultAction: 'detect',  contextRequired: false, reasonCode: 'heavy-urgency' },
  { term: 'no choice',     category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: 'you always',    category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-blame' },
  { term: 'you never',     category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-blame' },
  { term: 'you failed',    category: 'pressure', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-blame' },
  { term: 'if you cared',  category: 'manipulation', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-pressure' },
  { term: "that's wrong",  category: 'insult', severity: 'low', defaultAction: 'detect', contextRequired: false, reasonCode: 'possible-blame' },

  // ── Insult ─────────────────────────────────────────────────────────────────
  { term: 'stupid',    category: 'insult', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'idiot',     category: 'insult', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'loser',     category: 'insult', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'worthless', category: 'insult', severity: 'high',   defaultAction: 'caution', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'pathetic',  category: 'insult', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'useless',   category: 'insult', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'disgusting',category: 'insult', severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },

  // ── Threat ─────────────────────────────────────────────────────────────────
  { term: "you'll regret",   category: 'threat', severity: 'high', defaultAction: 'hold',    contextRequired: false, reasonCode: 'possible-threat' },
  { term: "you'll pay",      category: 'threat', severity: 'high', defaultAction: 'hold',    contextRequired: false, reasonCode: 'possible-threat' },
  { term: "you'll be sorry", category: 'threat', severity: 'high', defaultAction: 'hold',    contextRequired: false, reasonCode: 'possible-threat' },
  { term: "i'll make you",   category: 'threat', severity: 'high', defaultAction: 'hold',    contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'or else',         category: 'threat', severity: 'medium', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'i will hurt you', category: 'threat', severity: 'high', defaultAction: 'hold',    contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'watch out',       category: 'threat', severity: 'medium', defaultAction: 'reflect', contextRequired: true,  reasonCode: 'possible-threat' },
  { term: 'i know where',    category: 'threat', severity: 'high', defaultAction: 'hold',    contextRequired: true,  reasonCode: 'possible-threat' },

  // ── Hate ──────────────────────────────────────────────────────────────────
  { term: 'hate',      category: 'hate',    severity: 'medium', defaultAction: 'reflect', contextRequired: true,  reasonCode: 'emotional-intensity' },
  { term: 'hatred',    category: 'hate',    severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'destroy',   category: 'hate',    severity: 'medium', defaultAction: 'reflect', contextRequired: true,  reasonCode: 'possible-threat' },
  { term: 'kill',      category: 'hate',    severity: 'high',   defaultAction: 'caution', contextRequired: true,  reasonCode: 'possible-threat' },
  { term: 'attack',    category: 'hate',    severity: 'medium', defaultAction: 'reflect', contextRequired: true,  reasonCode: 'possible-threat' },
  { term: 'revenge',   category: 'hate',    severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'corrupt',   category: 'hate',    severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },
  { term: 'liar',      category: 'insult',  severity: 'medium', defaultAction: 'reflect', contextRequired: false, reasonCode: 'direct-attack' },
  { term: 'lying',     category: 'insult',  severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },

  // ── Non-consensual sexual (Shield-linked, requires escalation) ───────────────
  { term: 'rape',           category: 'nonConsensualSexual', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-sexual-violence' },
  { term: 'i will rape',    category: 'nonConsensualSexual', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-sexual-violence' },
  { term: "i'll rape",      category: 'nonConsensualSexual', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-sexual-violence' },
  { term: 'sexual assault', category: 'nonConsensualSexual', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-sexual-violence' },
  { term: 'force sex',      category: 'nonConsensualSexual', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-sexual-violence' },

  // ── Child safety (Shield — critical, never contextRequired) ─────────────────
  { term: 'child porn',      category: 'childSafety', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-child-safety' },
  { term: 'child sexual',    category: 'childSafety', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-child-safety' },
  { term: 'csam',            category: 'childSafety', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-child-safety' },
  { term: 'minor sexual',    category: 'childSafety', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-child-safety' },
  { term: 'underage sexual', category: 'childSafety', severity: 'critical', defaultAction: 'block', contextRequired: false, reasonCode: 'shield-child-safety' },

  // ── Scam ───────────────────────────────────────────────────────────────────
  { term: 'send money',     category: 'scam', severity: 'high', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-scam' },
  { term: 'wire transfer',  category: 'scam', severity: 'high', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-scam' },
  { term: 'click here',     category: 'scam', severity: 'medium', defaultAction: 'reflect', contextRequired: true, reasonCode: 'possible-scam' },
  { term: 'verify now',     category: 'scam', severity: 'high', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-scam' },
  { term: 'account number', category: 'scam', severity: 'high', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-scam' },
  { term: 'bank details',   category: 'scam', severity: 'high', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-scam' },
  { term: 'gift card',      category: 'scam', severity: 'high', defaultAction: 'caution', contextRequired: false, reasonCode: 'possible-scam' },
  { term: 'confirm your',   category: 'scam', severity: 'medium', defaultAction: 'reflect', contextRequired: true, reasonCode: 'possible-scam' },

  // ── Self-harm ──────────────────────────────────────────────────────────────
  { term: 'kill myself',   category: 'selfHarm', severity: 'critical', defaultAction: 'hold', contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'end my life',   category: 'selfHarm', severity: 'critical', defaultAction: 'hold', contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'hurt myself',   category: 'selfHarm', severity: 'high',     defaultAction: 'hold', contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'cut myself',    category: 'selfHarm', severity: 'high',     defaultAction: 'hold', contextRequired: false, reasonCode: 'possible-threat' },

  // ── Doxxing ────────────────────────────────────────────────────────────────
  { term: 'your address',   category: 'doxxing', severity: 'high', defaultAction: 'hold', contextRequired: true, reasonCode: 'possible-threat' },
  { term: "i know where you live", category: 'doxxing', severity: 'critical', defaultAction: 'hold', contextRequired: false, reasonCode: 'possible-threat' },
  { term: 'post your info', category: 'doxxing', severity: 'high', defaultAction: 'hold', contextRequired: false, reasonCode: 'possible-threat' },

  // ── Manipulation ──────────────────────────────────────────────────────────
  { term: 'always',    category: 'manipulation', severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },
  { term: 'never',     category: 'manipulation', severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },
  { term: 'everyone',  category: 'manipulation', severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },
  { term: 'nobody',    category: 'manipulation', severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },
  { term: 'no one',    category: 'manipulation', severity: 'low',    defaultAction: 'detect',  contextRequired: true,  reasonCode: 'possible-blame' },
];

// ─── Context pattern rules ─────────────────────────────────────────────────────
//
// Context patterns override the defaultAction from term detection upward.
// They match multi-word phrases and specific combinations.
// Patterns are tested against the full lowercased text.

export type ContextOverrideAction = 'reflect' | 'caution' | 'hold' | 'block';

export interface ContextPattern {
  pattern: RegExp;
  overrideAction: ContextOverrideAction;
  reasonCode: ReasonCode;
  description: string;
}

export const CONTEXT_PATTERNS: readonly ContextPattern[] = [
  // ── Profanity + direct attack (fuck you, screw you) ───────────────────────
  {
    pattern: /\b(fuck|screw|go to hell)\s+(you|him|her|them|off)\b/i,
    overrideAction: 'caution',
    reasonCode: 'direct-attack',
    description: 'profanity + direct attack',
  },
  // ── Profanity + physical threat (fuck you up, mess you up) ───────────────
  {
    pattern: /\b(fuck|beat|mess|rough)\s+(you|him|her|them)\s+(up)\b/i,
    overrideAction: 'hold',
    reasonCode: 'possible-threat',
    description: 'profanity + physical threat',
  },
  // ── Explicit physical threat ─────────────────────────────────────────────
  {
    pattern: /\b(i will|i'll|gonna|going to)\s+(hurt|harm|kill|destroy|attack|beat|assault)\s+(you|him|her|them)\b/i,
    overrideAction: 'hold',
    reasonCode: 'possible-threat',
    description: 'explicit physical threat',
  },
  // ── Sexual + child terms → critical Shield escalation ────────────────────
  {
    pattern: /\b(sex(ual)?|nude|naked|porn)\s+(with\s+)?(child|kid|minor|underage|teen|boy|girl)\b/i,
    overrideAction: 'block',
    reasonCode: 'shield-child-safety',
    description: 'sexual + child term — Shield escalation',
  },
  // ── Scam / bot repeated link pattern ─────────────────────────────────────
  {
    pattern: /https?:\/\/\S+/gi,
    overrideAction: 'reflect',
    reasonCode: 'possible-scam',
    description: 'link detected — low risk, reflect',
  },
  // ── You always / you never + listen/do/care (blame) ──────────────────────
  {
    pattern: /\byou\s+(always|never)\s+(listen|do|care|help|understand|get it|try)\b/i,
    overrideAction: 'reflect',
    reasonCode: 'possible-blame',
    description: 'you always/never + action — blame pattern',
  },
  // ── High punctuation intensity ────────────────────────────────────────────
  {
    pattern: /[!?]{3,}/,
    overrideAction: 'reflect',
    reasonCode: 'heavy-urgency',
    description: 'high punctuation intensity',
  },
];

// ─── Shield-escalation categories ─────────────────────────────────────────────
//
// Any term from these categories forces shieldEscalationRequired = true.

export const SHIELD_ESCALATION_CATEGORIES: readonly TaxonomyCategory[] = [
  'childSafety',
  'nonConsensualSexual',
];

// ─── Action level ordering ────────────────────────────────────────────────────

const ACTION_ORDER: TaxonomyDefaultAction[] = ['detect', 'reflect', 'caution', 'hold', 'block'];

export function compareActions(
  a: TaxonomyDefaultAction | ContextOverrideAction,
  b: TaxonomyDefaultAction | ContextOverrideAction,
): number {
  return ACTION_ORDER.indexOf(a as TaxonomyDefaultAction) - ACTION_ORDER.indexOf(b as TaxonomyDefaultAction);
}

/** Return the more severe of two actions. */
export function maxAction(
  a: TaxonomyDefaultAction | ContextOverrideAction,
  b: TaxonomyDefaultAction | ContextOverrideAction,
): TaxonomyDefaultAction {
  return compareActions(a, b) >= 0 ? (a as TaxonomyDefaultAction) : (b as TaxonomyDefaultAction);
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Find all taxonomy terms that appear in a lowercased text. */
export function matchTaxonomyTerms(textLower: string): TaxonomyEntry[] {
  return TAXONOMY_TERMS.filter((entry) =>
    textLower.includes(entry.term.toLowerCase()),
  );
}

/** Find all context patterns that match a text. */
export function matchContextPatterns(text: string): ContextPattern[] {
  return CONTEXT_PATTERNS.filter((cp) => cp.pattern.test(text));
}

/** True when any matched term or context pattern requires Shield escalation. */
export function requiresShieldEscalation(
  terms: TaxonomyEntry[],
  contextMatches: ContextPattern[],
): boolean {
  const termEscalation = terms.some((t) =>
    (SHIELD_ESCALATION_CATEGORIES as string[]).includes(t.category),
  );
  const contextEscalation = contextMatches.some(
    (cp) => cp.reasonCode === 'shield-child-safety' || cp.reasonCode === 'shield-sexual-violence',
  );
  return termEscalation || contextEscalation;
}

/** Compute the highest action level from matched terms and context patterns. */
export function computeHighestAction(
  terms: TaxonomyEntry[],
  contextMatches: ContextPattern[],
): TaxonomyDefaultAction {
  let highest: TaxonomyDefaultAction = 'detect';
  for (const t of terms) {
    highest = maxAction(highest, t.defaultAction);
  }
  for (const cp of contextMatches) {
    highest = maxAction(highest, cp.overrideAction);
  }
  return highest;
}

// ─── Registry-level helpers (Pass 136) ───────────────────────────────────────

/**
 * Normalize text for taxonomy matching: lowercase, collapse whitespace,
 * strip leading/trailing whitespace, preserve punctuation.
 */
export function normalizeForTaxonomy(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Find all taxonomy term matches for a raw text string.
 * Normalizes internally — call with the original text.
 */
export function findTaxonomyMatches(text: string): TaxonomyEntry[] {
  const normalized = normalizeForTaxonomy(text);
  return TAXONOMY_TERMS.filter((entry) =>
    normalized.includes(entry.term.toLowerCase()),
  );
}

/**
 * Return all taxonomy matches for a specific category.
 */
export function getCategoryMatches(
  text: string,
  category: TaxonomyCategory,
): TaxonomyEntry[] {
  return findTaxonomyMatches(text).filter((e) => e.category === category);
}

/**
 * True when the text contains a term or pattern from a critical-severity
 * Shield-escalation category (childSafety, nonConsensualSexual).
 */
export function hasCriticalSafetyMatch(text: string): boolean {
  const terms = findTaxonomyMatches(text);
  const termMatch = terms.some((t) =>
    (SHIELD_ESCALATION_CATEGORIES as string[]).includes(t.category),
  );
  if (termMatch) return true;
  const contextMatches = matchContextPatterns(text);
  return contextMatches.some(
    (cp) =>
      cp.reasonCode === 'shield-child-safety' ||
      cp.reasonCode === 'shield-sexual-violence',
  );
}

/**
 * Classify the overall severity of a set of taxonomy matches.
 * Returns the highest severity level found, or 'low' for empty input.
 */
export function classifyTaxonomySeverity(matches: TaxonomyEntry[]): TaxonomySeverity {
  const ORDER: TaxonomySeverity[] = ['low', 'medium', 'high', 'critical'];
  let highest: TaxonomySeverity = 'low';
  for (const m of matches) {
    if (ORDER.indexOf(m.severity) > ORDER.indexOf(highest)) {
      highest = m.severity;
    }
  }
  return highest;
}

// ─── Multilingual routing (Pass 138) ─────────────────────────────────────────

import type { SupportedAnalysisLanguage } from './multilingualTaxonomy';
import { getLanguageAdapter, inferAdapterFromText } from './multilingualTaxonomy';

/**
 * Find taxonomy matches for any supported language.
 *
 * When `languageHint` is omitted or 'en', the existing English taxonomy is used.
 * For non-Latin scripts (ar/zh/ja), the language-specific adapter runs first;
 * if it returns matches, those are returned. If no matches are found, the
 * function falls back to the English taxonomy so cross-language content is
 * still covered (e.g. mixed-language messages).
 *
 * For multilingual/unknown input, script detection selects the adapter.
 */
export function findMultilingualTaxonomyMatches(
  text: string,
  languageHint?: SupportedAnalysisLanguage,
): TaxonomyEntry[] {
  // English and latin-script languages: existing path
  if (!languageHint || languageHint === 'en' || ['fr','de','es','it','pt','id'].includes(languageHint)) {
    return findTaxonomyMatches(text);
  }

  const adapter = languageHint === 'multilingual'
    ? inferAdapterFromText(text)
    : getLanguageAdapter(languageHint);

  const normalized = adapter.normalize(text);
  const adapterMatches = adapter.entries.filter((entry) =>
    normalized.includes(entry.term),
  );

  // Always also run English taxonomy as a safety net for mixed content
  const englishMatches = findTaxonomyMatches(text);

  // Merge, deduplicate by term
  const seen = new Set<string>();
  const merged: TaxonomyEntry[] = [];
  for (const m of [...adapterMatches, ...englishMatches]) {
    if (!seen.has(m.term)) {
      seen.add(m.term);
      merged.push(m);
    }
  }
  return merged;
}
