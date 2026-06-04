/**
 * QLPA Visual Engine
 * Canonical semantic mappings from QLPA status kinds to CSS class names.
 * Reference: docs/design/QLPA-CANON.md
 *
 * Law: colors must calm, clarify, and guide.
 * Red is reserved for true danger or irreversible action only.
 * Do not make every state saturated cyan. Let most UI rest in mist.
 */

// ── Tone types ────────────────────────────────────────────────────────────────

export type QLPAVisualTone =
  | 'aether'    // deep space — background, silence
  | 'water'     // crystal aqua — primary action, communication, encrypted, local-first
  | 'heart'     // jade green — safe, protected, consent alive, allowed
  | 'solar'     // soft gold — pending, waiting, gentle attention, processing
  | 'care'      // rose — human warmth, support, compassion
  | 'ocean'     // deep blue — sovereignty, identity, deep trust
  | 'crown'     // violet — developer, advanced, integrity, diagnostics
  | 'rootAlert' // root red — danger only, blocked, irreversible. DO NOT overuse.
  | 'muted'     // mist blue-gray — neutral, receded, off, quiet states
  | 'glass';    // transparent crystalline — surface default

// ── Status kinds ─────────────────────────────────────────────────────────────

export type QLPAStatusKind =
  | 'protected'   // consent given, channel safe → jade heart
  | 'allowed'     // permission confirmed → jade heart
  | 'waiting'     // in transit, relay in progress → solar gold
  | 'pending'     // awaiting approval, not yet confirmed → solar gold
  | 'blocked'     // contact/channel refused → root red
  | 'danger'      // destructive or irreversible action → root red
  | 'developer'   // dev mode, diagnostics, advanced → crown violet
  | 'localFirst'  // data stays on device → crystal water
  | 'encrypted'   // end-to-end encryption active → crystal water
  | 'trust'       // established trust relationship → jade heart
  | 'sovereignty' // self-sovereign identity, deep trust → ocean blue
  | 'privacy'     // privacy layer active → crystal water
  | 'delivery'    // message delivery state → solar gold
  | 'care'        // human support, warmth → rose care
  | 'identity'    // Earth ID, identity layer → ocean blue
  | 'neutral';    // no strong state — informational → mist

// ── Status → Tone mapping ────────────────────────────────────────────────────

export const STATUS_TONE: Record<QLPAStatusKind, QLPAVisualTone> = {
  protected:   'heart',
  allowed:     'heart',
  trust:       'heart',
  encrypted:   'water',
  localFirst:  'water',
  privacy:     'water',
  waiting:     'solar',
  pending:     'solar',
  delivery:    'solar',
  care:        'care',
  sovereignty: 'ocean',
  identity:    'ocean',
  developer:   'crown',
  blocked:     'rootAlert',
  danger:      'rootAlert',
  neutral:     'muted',
};

// ── Tone → CSS class fragments ───────────────────────────────────────────────
// These map to the canonical classes defined in globals.css

export const TONE_CHIP_CLASS: Record<QLPAVisualTone, string> = {
  aether:    'qlpa-chip qlpa-chip-muted',
  water:     'qlpa-chip qlpa-chip-water',
  heart:     'qlpa-chip qlpa-chip-heart',
  solar:     'qlpa-chip qlpa-chip-solar',
  care:      'qlpa-chip qlpa-chip-care',
  ocean:     'qlpa-chip qlpa-chip-water',   // ocean uses water chip, deeper tint
  crown:     'qlpa-chip qlpa-chip-crown',
  rootAlert: 'qlpa-chip qlpa-chip-danger',
  muted:     'qlpa-chip qlpa-chip-muted',
  glass:     'qlpa-chip qlpa-chip-muted',
};

export const TONE_ICON_CLASS: Record<QLPAVisualTone, string> = {
  aether:    'text-muted-foreground',
  water:     'text-sky-400',
  heart:     'text-emerald-400',
  solar:     'text-amber-400',
  care:      'text-rose-400',
  ocean:     'text-blue-400',
  crown:     'text-violet-400',
  rootAlert: 'text-red-400',
  muted:     'text-muted-foreground',
  glass:     'text-muted-foreground',
};

export const TONE_ICON_CONTAINER_CLASS: Record<QLPAVisualTone, string> = {
  aether:    'bg-muted/40',
  water:     'bg-sky-500/10 border border-sky-500/20',
  heart:     'bg-emerald-500/10 border border-emerald-500/20',
  solar:     'bg-amber-500/10 border border-amber-500/20',
  care:      'bg-rose-500/10 border border-rose-500/20',
  ocean:     'bg-blue-500/10 border border-blue-500/18',
  crown:     'bg-violet-500/10 border border-violet-500/20',
  rootAlert: 'bg-red-500/10 border border-red-500/20',
  muted:     'bg-muted/30 border border-border/40',
  glass:     'bg-white/5 border border-white/10',
};

export const TONE_BORDER_CLASS: Record<QLPAVisualTone, string> = {
  aether:    'border-border/30',
  water:     'border-sky-500/25',
  heart:     'border-emerald-500/25',
  solar:     'border-amber-500/25',
  care:      'border-rose-500/25',
  ocean:     'border-blue-500/22',
  crown:     'border-violet-500/25',
  rootAlert: 'border-red-500/25',
  muted:     'border-border/40',
  glass:     'border-white/10',
};

export const TONE_SOFT_BG_CLASS: Record<QLPAVisualTone, string> = {
  aether:    'bg-background/60',
  water:     'bg-sky-500/8',
  heart:     'bg-emerald-500/8',
  solar:     'bg-amber-500/8',
  care:      'bg-rose-500/8',
  ocean:     'bg-blue-500/7',
  crown:     'bg-violet-500/8',
  rootAlert: 'bg-red-500/8',
  muted:     'bg-muted/30',
  glass:     'bg-white/4',
};

export const TONE_TEXT_CLASS: Record<QLPAVisualTone, string> = {
  aether:    'text-foreground/60',
  water:     'text-sky-300',
  heart:     'text-emerald-300',
  solar:     'text-amber-300',
  care:      'text-rose-300',
  ocean:     'text-blue-300',
  crown:     'text-violet-300',
  rootAlert: 'text-red-300',
  muted:     'text-muted-foreground',
  glass:     'text-foreground/70',
};

// ── Convenience helpers ───────────────────────────────────────────────────────

/** Get chip class directly from a status kind. */
export function chipClassForStatus(status: QLPAStatusKind): string {
  return TONE_CHIP_CLASS[STATUS_TONE[status]];
}

/** Get icon CSS class directly from a status kind. */
export function iconClassForStatus(status: QLPAStatusKind): string {
  return TONE_ICON_CLASS[STATUS_TONE[status]];
}

/** Get icon container class from a status kind. */
export function iconContainerForStatus(status: QLPAStatusKind): string {
  return TONE_ICON_CONTAINER_CLASS[STATUS_TONE[status]];
}

/** Get text class from a status kind. */
export function textClassForStatus(status: QLPAStatusKind): string {
  return TONE_TEXT_CLASS[STATUS_TONE[status]];
}

/** Get soft background class from a status kind. */
export function softBgForStatus(status: QLPAStatusKind): string {
  return TONE_SOFT_BG_CLASS[STATUS_TONE[status]];
}

/** Get border class from a status kind. */
export function borderForStatus(status: QLPAStatusKind): string {
  return TONE_BORDER_CLASS[STATUS_TONE[status]];
}
