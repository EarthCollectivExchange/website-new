// ─── QLPA Intention Mirror ────────────────────────────────────────────────────
//
// Language harmony analysis for the Intention Mirror feature.
// "Zero Negative Blueprint Energy Checker" — internal concept name.
//
// Privacy rules (non-negotiable):
//   - All analysis is local-only. Text never leaves the device.
//   - No fetch, no XMLHttpRequest, no supabase calls.
//   - No server-side AI. Pattern-based and taxonomy-based only.
//   - Emergency messages bypass analysis entirely.
//   - User can always send the original message (except Shield escalation).
//
// This is NOT censorship. It is a mirror — showing the sender what their
// message might feel like to the recipient.

import {
  type LanguageDimension,
  type LanguageDimensionScores,
  type LanguageResultLevel,
  computeCompositeScore,
  hasShieldEscalationSignal,
  scoreTolevel,
} from './languageBlueprint';

import type { ReasonCode, SuggestionKey } from './intentionMirrorTypes';
export type { ReasonCode, SuggestionKey };

import {
  findTaxonomyMatches,
  findMultilingualTaxonomyMatches,
  matchContextPatterns,
  requiresShieldEscalation,
  computeHighestAction,
  type TaxonomyDefaultAction,
} from './languageTaxonomy';

import type { SupportedAnalysisLanguage } from './multilingualTaxonomy';

import { getSuggestionKeys as getSuggestionKeysFromEngine } from './languageSuggestionEngine';

// ─── Analysis context ─────────────────────────────────────────────────────────

export type ConversationContext = 'direct' | 'group' | 'community' | 'unknown';

export interface IntentionMirrorContext {
  conversationContext: ConversationContext;
  isBroadcast: boolean;
  isEmergency: boolean;
  /** Optional language hint for multilingual analysis routing. */
  languageHint?: SupportedAnalysisLanguage;
}

// ─── Analysis result ──────────────────────────────────────────────────────────

export interface IntentionMirrorAnalysis {
  level: LanguageResultLevel;
  score: number;
  reasonCodes: ReasonCode[];
  dimensions: Partial<LanguageDimensionScores>;
  userMessageKey: string;
  suggestionKeys: SuggestionKey[];
  canSendOriginal: boolean;
  shieldEscalationRequired: boolean;
}

// ─── Action → result level mapping ───────────────────────────────────────────

function actionToLevel(action: TaxonomyDefaultAction): LanguageResultLevel {
  switch (action) {
    case 'detect':  return 'clear';
    case 'reflect': return 'reflect';
    case 'caution': return 'caution';
    case 'hold':    return 'hold';
    case 'block':   return 'block';
  }
}

// ─── Dimension score from action ──────────────────────────────────────────────
//
// Converts a taxonomy action level to a rough dimension score (0–100).
// These feed into computeCompositeScore for the numeric display.

function actionToDimensionScore(action: TaxonomyDefaultAction): number {
  switch (action) {
    case 'detect':  return 10;
    case 'reflect': return 28;
    case 'caution': return 45;
    case 'hold':    return 70;
    case 'block':   return 95;
  }
}

// ─── Category → dimension mapping ────────────────────────────────────────────

import type { TaxonomyCategory } from './languageTaxonomy';

function categoryToDimension(category: TaxonomyCategory): LanguageDimension {
  switch (category) {
    case 'emotion':             return 'safety';
    case 'profanity':           return 'clarity';
    case 'pressure':            return 'pressure';
    case 'insult':              return 'consent';
    case 'threat':              return 'safety';
    case 'hate':                return 'safety';
    case 'sexual':              return 'safety';
    case 'nonConsensualSexual': return 'sexualViolence';
    case 'childSafety':         return 'childSafety';
    case 'scam':                return 'scamRisk';
    case 'botSpam':             return 'botSpam';
    case 'selfHarm':            return 'safety';
    case 'doxxing':             return 'safety';
    case 'manipulation':        return 'consent';
  }
}

// ─── Suggestion keys from reason codes + suggestion engine ────────────────────

function buildSuggestionKeys(reasonCodes: ReasonCode[], text: string): SuggestionKey[] {
  const seen = new Set<SuggestionKey>();
  const suggestions: SuggestionKey[] = [];

  function add(key: SuggestionKey) {
    if (!seen.has(key)) { seen.add(key); suggestions.push(key); }
  }

  // Reason-code driven suggestions
  if (reasonCodes.includes('possible-blame') || reasonCodes.includes('absolute-language')) {
    add('languageHarmony.suggestionFeelUnheard');
  }
  if (reasonCodes.includes('heavy-urgency') || reasonCodes.includes('possible-pressure')) {
    add('languageHarmony.suggestionPrioritize');
  }
  if (reasonCodes.includes('emotional-intensity') || reasonCodes.includes('strong-emotion')) {
    add('languageHarmony.suggestionOpenRequest');
  }
  if (reasonCodes.includes('possible-threat') || reasonCodes.includes('direct-attack')) {
    add('languageHarmony.suggestionDifferentView');
  }

  // Suggestion engine pattern-based suggestions (merged, deduplicated)
  for (const key of getSuggestionKeysFromEngine(text)) {
    if (key.startsWith('languageHarmony.')) {
      add(key as SuggestionKey);
    }
  }

  return suggestions;
}

// ─── User message key from level ─────────────────────────────────────────────

function levelToMessageKey(level: LanguageResultLevel): string {
  switch (level) {
    case 'clear':   return 'languageHarmony.clearMessage';
    case 'reflect': return 'languageHarmony.reflectMessage';
    case 'caution': return 'languageHarmony.cautionMessage';
    case 'hold':    return 'languageHarmony.holdMessage';
    case 'block':   return 'languageHarmony.blockMessage';
  }
}

// ─── Bot repetition heuristic ─────────────────────────────────────────────────

function detectBotRepetition(text: string): boolean {
  const words = text.trim().toLowerCase().split(/\s+/);
  if (words.length < 6) return false;
  for (let i = 0; i < words.length - 2; i++) {
    if (words[i] === words[i + 1] && words[i + 1] === words[i + 2]) return true;
  }
  return false;
}

// ─── Main analysis function ───────────────────────────────────────────────────

/**
 * Analyze a message text using the QLPA language taxonomy + context patterns.
 *
 * Rules:
 *   - Profanity alone → detected, canSendOriginal=true (low/medium only)
 *   - Emotion words alone → detected, canSendOriginal=true
 *   - Profanity + direct attack ("fuck you") → caution
 *   - Threat patterns → hold
 *   - Shield categories (child safety, sexual violence) → block + escalation
 *   - Emergency messages → always clear, bypass all analysis
 *
 * All analysis is local. No text leaves the device.
 */
export function analyzeTextForIntentionMirror(
  text: string,
  context: IntentionMirrorContext,
): IntentionMirrorAnalysis {
  // Emergency bypass — never analyze emergency messages
  if (context.isEmergency || !text || text.trim().length === 0) {
    return {
      level: 'clear',
      score: 0,
      reasonCodes: [],
      dimensions: {},
      userMessageKey: 'languageHarmony.clearMessage',
      suggestionKeys: [],
      canSendOriginal: true,
      shieldEscalationRequired: false,
    };
  }

  // Match taxonomy terms and context patterns
  // Routes through multilingual adapter when a language hint is provided.
  // Falls back to English taxonomy for latin-script languages.
  const termMatches = context.languageHint && context.languageHint !== 'en'
    ? findMultilingualTaxonomyMatches(text, context.languageHint)
    : findTaxonomyMatches(text);
  const contextMatches = matchContextPatterns(text);

  // Bot repetition check
  const hasBotRepetition = detectBotRepetition(text);

  // Collect reason codes (deduplicated)
  const reasonCodeSet = new Set<ReasonCode>();
  for (const t of termMatches) reasonCodeSet.add(t.reasonCode);
  for (const cp of contextMatches) reasonCodeSet.add(cp.reasonCode);
  if (hasBotRepetition) reasonCodeSet.add('bot-repetition');
  const reasonCodes = Array.from(reasonCodeSet);

  // Build dimension scores from matched terms
  const dimensionScores: Partial<LanguageDimensionScores> = {};
  for (const t of termMatches) {
    const dim = categoryToDimension(t.category);
    const score = actionToDimensionScore(t.defaultAction);
    const current = (dimensionScores as Record<string, number>)[dim] ?? 0;
    (dimensionScores as Record<string, number>)[dim] = Math.max(current, score);
  }

  // Apply context pattern overrides to dimension scores
  for (const cp of contextMatches) {
    // context patterns affect the 'safety' or 'consent' dimension based on reason
    const dim: LanguageDimension =
      cp.reasonCode === 'possible-scam' ? 'scamRisk'
      : cp.reasonCode === 'possible-blame' ? 'consent'
      : cp.reasonCode === 'shield-child-safety' ? 'childSafety'
      : cp.reasonCode === 'shield-sexual-violence' ? 'sexualViolence'
      : 'safety';
    const score = actionToDimensionScore(cp.overrideAction);
    const current = (dimensionScores as Record<string, number>)[dim] ?? 0;
    (dimensionScores as Record<string, number>)[dim] = Math.max(current, score);
  }

  if (hasBotRepetition) {
    const current = (dimensionScores as Record<string, number>)['botSpam'] ?? 0;
    (dimensionScores as Record<string, number>)['botSpam'] = Math.max(current, 55);
  }

  // Shield escalation check
  const shieldEscalationRequired = requiresShieldEscalation(termMatches, contextMatches)
    || hasShieldEscalationSignal(dimensionScores);

  // Compute highest action from all matches
  const highestAction = shieldEscalationRequired
    ? 'block'
    : computeHighestAction(termMatches, contextMatches);

  // Map to result level
  let level: LanguageResultLevel;
  if (shieldEscalationRequired) {
    level = 'block';
  } else {
    // Use both taxonomy-action level and composite numeric score — take the higher
    const actionLevel = actionToLevel(highestAction);
    const compositeScore = computeCompositeScore(dimensionScores);
    const scoreLevel = scoreTolevel(compositeScore);
    const ACTION_LEVEL_ORDER: LanguageResultLevel[] = ['clear', 'reflect', 'caution', 'hold', 'block'];
    level = ACTION_LEVEL_ORDER.indexOf(actionLevel) >= ACTION_LEVEL_ORDER.indexOf(scoreLevel)
      ? actionLevel
      : scoreLevel;
  }

  const compositeScore = shieldEscalationRequired ? 100 : computeCompositeScore(dimensionScores);

  return {
    level,
    score: compositeScore,
    reasonCodes,
    dimensions: dimensionScores,
    userMessageKey: levelToMessageKey(level),
    suggestionKeys: buildSuggestionKeys(reasonCodes, text),
    // User can always send unless Shield escalation is required
    canSendOriginal: !shieldEscalationRequired,
    shieldEscalationRequired,
  };
}
