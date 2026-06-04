// ─── QLPA Language Blueprint ──────────────────────────────────────────────────
//
// Canonical dimensions, result levels, and scoring weights for the
// Language Harmony system (internally: Zero Negative Blueprint Energy Checker).
//
// Design rules:
//   - All functions are pure — no side effects, no I/O.
//   - This module defines types and constants only.
//     No text scanning happens here.
//   - Result levels are NOT censorship levels. They are reflection levels.
//     Even 'block' means "Shield has flagged severe content" — the user
//     still chooses what to do; the system cannot send on their behalf.
//   - Normal emotional language never reaches 'hold' or 'block'.
//   - Fibonacci-aligned thresholds mirror the phi-based design system.

// ─── Language dimensions ──────────────────────────────────────────────────────
//
// Each dimension is scored 0–100 where:
//   0 = no signal in this dimension
//   100 = maximum detected signal
//
// Dimensions are NOT punishments — they are observations about tone.

export type LanguageDimension =
  | 'clarity'        // how clearly the message communicates intent
  | 'consent'        // whether the message respects the recipient's autonomy
  | 'pressure'       // urgency/coercion signals
  | 'care'           // warmth/consideration for the recipient
  | 'sovereignty'    // respect for both parties' boundaries
  | 'safety'         // proximity to harm vocabulary
  | 'publicRisk'     // risk if the message were made public
  | 'childSafety'    // signals related to child safety (Shield-linked)
  | 'sexualViolence' // signals related to sexual violence (Shield-linked)
  | 'botSpam'        // pattern repetition / bot-like signals
  | 'scamRisk';      // financial manipulation / urgency + credential ask

export type LanguageDimensionScores = Record<LanguageDimension, number>;

export const ALL_LANGUAGE_DIMENSIONS: readonly LanguageDimension[] = [
  'clarity',
  'consent',
  'pressure',
  'care',
  'sovereignty',
  'safety',
  'publicRisk',
  'childSafety',
  'sexualViolence',
  'botSpam',
  'scamRisk',
];

// ─── Result levels ────────────────────────────────────────────────────────────
//
// What the Intention Mirror shows the user.
// These are reflection levels, not verdicts.

export type LanguageResultLevel =
  | 'clear'    // 0–21:   message reads fine; no reflection needed
  | 'reflect'  // 22–34:  gentle nudge — "here's what we noticed"
  | 'caution'  // 35–55:  soft suggestion — consider rewording
  | 'hold'     // 56–89:  strong reflection — review before sending
  | 'block';   // 90–100: severe Shield category detected — escalation required

export const ALL_RESULT_LEVELS: readonly LanguageResultLevel[] = [
  'clear',
  'reflect',
  'caution',
  'hold',
  'block',
];

// ─── Fibonacci-aligned score thresholds ──────────────────────────────────────
//
// Aligned to the phi-based design system (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89).
// Scores are integers 0–100.

export interface ResultThreshold {
  level: LanguageResultLevel;
  min: number;
  max: number;
}

export const RESULT_THRESHOLDS: readonly ResultThreshold[] = [
  { level: 'clear',   min: 0,  max: 21  },
  { level: 'reflect', min: 22, max: 34  },
  { level: 'caution', min: 35, max: 55  },
  { level: 'hold',    min: 56, max: 89  },
  { level: 'block',   min: 90, max: 100 },
];

// ─── QLPA weights ─────────────────────────────────────────────────────────────
//
// How much each dimension contributes to the composite score.
// Weights sum to 100.
//
// Fibonacci-inspired allocation:
//   safety: 34  (highest — proximity to harm is most important signal)
//   consent: 21 (user autonomy is foundational)
//   pressure: 13, clarity: 13 (equal — both affect message quality)
//   care: 8, sovereignty: 8   (equal — contextual warmth / boundary respect)
//   context: 3                (catch-all adjustment factor)
//
// Dimensions not in this weight map (publicRisk, childSafety, sexualViolence,
// botSpam, scamRisk) are Shield-linked and trigger escalation directly —
// they bypass composite scoring.

export interface DimensionWeight {
  dimension: LanguageDimension | 'context';
  weight: number;
}

export const QLPA_DIMENSION_WEIGHTS: readonly DimensionWeight[] = [
  { dimension: 'safety',      weight: 34 },
  { dimension: 'consent',     weight: 21 },
  { dimension: 'pressure',    weight: 13 },
  { dimension: 'clarity',     weight: 13 },
  { dimension: 'care',        weight: 8  },
  { dimension: 'sovereignty', weight: 8  },
  { dimension: 'context',     weight: 3  },
];

// Total weight must equal 100.
export const QLPA_WEIGHT_TOTAL = QLPA_DIMENSION_WEIGHTS.reduce(
  (sum, w) => sum + w.weight,
  0,
);

// ─── Shield-linked dimensions ─────────────────────────────────────────────────
//
// These dimensions bypass normal scoring — any non-zero signal triggers
// shieldEscalationRequired in the IntentionMirror analysis result.

export const SHIELD_ESCALATION_DIMENSIONS: readonly LanguageDimension[] = [
  'childSafety',
  'sexualViolence',
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Map a composite score (0–100) to a result level. */
export function scoreTolevel(score: number): LanguageResultLevel {
  for (const threshold of RESULT_THRESHOLDS) {
    if (score >= threshold.min && score <= threshold.max) {
      return threshold.level;
    }
  }
  return 'block';
}

/** Return the threshold range for a given result level. */
export function getThresholdForLevel(level: LanguageResultLevel): ResultThreshold {
  return RESULT_THRESHOLDS.find((t) => t.level === level) ?? RESULT_THRESHOLDS[0];
}

/** Compute the weighted composite score from dimension scores. */
export function computeCompositeScore(
  scores: Partial<LanguageDimensionScores>,
): number {
  let total = 0;
  for (const { dimension, weight } of QLPA_DIMENSION_WEIGHTS) {
    if (dimension === 'context') continue; // context is a modifier, not a raw dimension
    const raw = dimension in scores ? (scores as Record<string, number>)[dimension] ?? 0 : 0;
    total += (raw / 100) * weight;
  }
  return Math.min(100, Math.round(total));
}

/** True when any Shield-escalation dimension has a non-zero score. */
export function hasShieldEscalationSignal(
  scores: Partial<LanguageDimensionScores>,
): boolean {
  return SHIELD_ESCALATION_DIMENSIONS.some(
    (d) => ((scores as Record<string, number>)[d] ?? 0) > 0,
  );
}
