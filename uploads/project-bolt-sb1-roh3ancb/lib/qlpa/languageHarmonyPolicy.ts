// ─── QLPA Language Harmony Policy ────────────────────────────────────────────
//
// Policy modes that control how the Intention Mirror behaves.
// No mode disables Shield protection for severe categories.
// All functions are pure.

import type { LanguageResultLevel } from './languageBlueprint';

// ─── Policy modes ─────────────────────────────────────────────────────────────

export type LanguageHarmonyMode =
  | 'off'       // Intention Mirror disabled; Shield severe categories still active
  | 'soft'      // Gentle suggestions only; never holds or blocks normal language
  | 'clear'     // Stronger reflection; no holds for standard emotional language
  | 'strict'    // May hold risky messages for user review
  | 'guardian'; // Stronger safety for group/community spaces

export const ALL_HARMONY_MODES: readonly LanguageHarmonyMode[] = [
  'off',
  'soft',
  'clear',
  'strict',
  'guardian',
];

// ─── Policy definition ────────────────────────────────────────────────────────

export interface LanguageHarmonyModePolicy {
  mode: LanguageHarmonyMode;
  /** Minimum result level that triggers user-visible reflection UI. */
  reflectThreshold: LanguageResultLevel;
  /** Minimum result level that pauses send for user review (not a block). */
  holdThreshold: LanguageResultLevel | null;
  /** Whether suggestions are shown when reflection is triggered. */
  showSuggestions: boolean;
  /** Whether the user can always override and send the original message. */
  alwaysAllowOverride: boolean;
  /** Stronger group/community safety rules active. */
  communityGuardActive: boolean;
}

export const HARMONY_MODE_POLICIES: Readonly<Record<LanguageHarmonyMode, LanguageHarmonyModePolicy>> = {
  off: {
    mode: 'off',
    reflectThreshold: 'block',  // only Shield-level content triggers anything
    holdThreshold: null,
    showSuggestions: false,
    alwaysAllowOverride: true,
    communityGuardActive: false,
  },
  soft: {
    mode: 'soft',
    reflectThreshold: 'caution', // gentle nudge from caution upward
    holdThreshold: null,          // never holds in soft mode
    showSuggestions: true,
    alwaysAllowOverride: true,
    communityGuardActive: false,
  },
  clear: {
    mode: 'clear',
    reflectThreshold: 'reflect',  // reflection from lowest signal upward
    holdThreshold: null,           // no holds; stronger reflection only
    showSuggestions: true,
    alwaysAllowOverride: true,
    communityGuardActive: false,
  },
  strict: {
    mode: 'strict',
    reflectThreshold: 'reflect',
    holdThreshold: 'hold',         // hold-level messages are paused for review
    showSuggestions: true,
    alwaysAllowOverride: true,     // user can always override the hold
    communityGuardActive: false,
  },
  guardian: {
    mode: 'guardian',
    reflectThreshold: 'reflect',
    holdThreshold: 'caution',      // caution+ messages are paused in guardian mode
    showSuggestions: true,
    alwaysAllowOverride: true,
    communityGuardActive: true,
  },
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** The ordered sequence of result levels for threshold comparison. */
const LEVEL_ORDER: LanguageResultLevel[] = [
  'clear',
  'reflect',
  'caution',
  'hold',
  'block',
];

function levelIndex(level: LanguageResultLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function getLanguageHarmonyModePolicy(
  mode: LanguageHarmonyMode,
): LanguageHarmonyModePolicy {
  return HARMONY_MODE_POLICIES[mode];
}

/** True when the result level meets or exceeds the policy's reflect threshold. */
export function shouldReflectLanguage(
  result: LanguageResultLevel,
  mode: LanguageHarmonyMode,
): boolean {
  if (result === 'block') return true; // shield always reflects
  const policy = HARMONY_MODE_POLICIES[mode];
  return levelIndex(result) >= levelIndex(policy.reflectThreshold);
}

/** True when the message should be held for user review before sending. */
export function shouldHoldForReview(
  result: LanguageResultLevel,
  mode: LanguageHarmonyMode,
): boolean {
  if (result === 'block') return true; // shield always holds
  const policy = HARMONY_MODE_POLICIES[mode];
  if (!policy.holdThreshold) return false;
  return levelIndex(result) >= levelIndex(policy.holdThreshold);
}

/** True when a Shield escalation is required regardless of mode. */
export function shouldBlockForShield(result: LanguageResultLevel): boolean {
  return result === 'block';
}

/**
 * True when the user can send the original message without modification.
 * This is ALWAYS true for non-block results — the system never auto-rewrites
 * or silently discards a message. Even in 'block' mode the user receives
 * a clear explanation and remains in control.
 */
export function canSendOriginal(
  result: LanguageResultLevel,
  mode: LanguageHarmonyMode,
): boolean {
  const policy = HARMONY_MODE_POLICIES[mode];
  // Override is always allowed in all modes
  if (policy.alwaysAllowOverride) return true;
  // Shield-level content: user must acknowledge before sending
  if (result === 'block') return false;
  return true;
}
