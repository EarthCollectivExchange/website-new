// ─── QLPA Trust Graph ─────────────────────────────────────────────────────────
//
// Canonical trust levels, permissions, and graph utilities.
// The trust model is a gradient from 'blocked' (no access) to 'self' (full access).
//
// Rule: each level is a strict superset of permissions from the level below it.
// Callers should always use trustMeetsMinimum() rather than string comparison.

export type { TrustLevel, TrustRelationship } from '@/lib/messaging/types';
export { resolveTrustLevel, validateTrustLevel, TRUST_ROUTING } from '@/lib/messaging/trust';
export type { TrustCheckInput, TrustCheckResult } from '@/lib/messaging/trust';

import type { TrustLevel } from '@/lib/messaging/types';
import type { ActiveSheet } from './appOrchestrator';

// ─── Ordered trust gradient ───────────────────────────────────────────────────
// Index 0 = least trusted, index 5 = most trusted.

export const TRUST_LEVELS_ORDERED = [
  'blocked',
  'unknown',
  'community',
  'known',
  'trusted',
  'self',
] as const satisfies readonly TrustLevel[];

// ─── Trust level metadata ─────────────────────────────────────────────────────

export interface TrustLevelMeta {
  level: TrustLevel;
  labelKey: string;
  descKey: string;
  /** True when messaging is possible at this level (with possible constraints) */
  canMessage: boolean;
  /** True when inviting to group spaces is possible */
  canInvite: boolean;
  /** True when relay delivery is permitted */
  canRelay: boolean;
}

export const TRUST_LEVEL_META: Record<TrustLevel, TrustLevelMeta> = {
  self: {
    level:      'self',
    labelKey:   'trust.self',
    descKey:    'trust.selfDesc',
    canMessage: true,
    canInvite:  true,
    canRelay:   true,
  },
  trusted: {
    level:      'trusted',
    labelKey:   'trust.trusted',
    descKey:    'trust.trustedDesc',
    canMessage: true,
    canInvite:  true,
    canRelay:   true,
  },
  known: {
    level:      'known',
    labelKey:   'trust.known',
    descKey:    'trust.knownDesc',
    canMessage: true,
    canInvite:  false,
    canRelay:   true,
  },
  community: {
    level:      'community',
    labelKey:   'trust.community',
    descKey:    'trust.communityDesc',
    canMessage: true,
    canInvite:  false,
    canRelay:   false,
  },
  unknown: {
    level:      'unknown',
    labelKey:   'trust.unknown',
    descKey:    'trust.unknownDesc',
    canMessage: false,
    canInvite:  false,
    canRelay:   false,
  },
  blocked: {
    level:      'blocked',
    labelKey:   'trust.blocked',
    descKey:    'trust.blockedDesc',
    canMessage: false,
    canInvite:  false,
    canRelay:   false,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTrustRank(level: TrustLevel): number {
  return TRUST_LEVELS_ORDERED.indexOf(level);
}

export function trustMeetsMinimum(
  level: TrustLevel,
  minimum: TrustLevel
): boolean {
  return getTrustRank(level) >= getTrustRank(minimum);
}

export function getTrustMeta(level: TrustLevel): TrustLevelMeta {
  return TRUST_LEVEL_META[level];
}

// ─── Conversation access states ───────────────────────────────────────────────
// Visual pill states for JourneyStatusBar and related components.
// Maps consent + trust combinations to a displayable state.
//
// States:
//   protected — local-only, no relay; maximum privacy
//   ready     — relay-ready, trusted relationship
//   allowed   — consent confirmed, message may proceed
//   pending   — awaiting approval or trust establishment
//   blocked   — access denied; action blocked
//   unknown   — trust/consent state not yet resolved

export type ConversationAccessState =
  | 'protected'
  | 'ready'
  | 'allowed'
  | 'pending'
  | 'blocked'
  | 'unknown';

export type AccessStateSeverity = 'safe' | 'caution' | 'danger' | 'neutral';

export interface AccessStateMeta {
  state: ConversationAccessState;
  labelKey: string;
  descKey: string;
  colorClass: string;
  severity: AccessStateSeverity;
  /** Which sheet opens when the user taps this pill. */
  recommendedSheet: NonNullable<ActiveSheet>;
}

export const ACCESS_STATE_META: Record<ConversationAccessState, AccessStateMeta> = {
  protected: {
    state:            'protected',
    labelKey:         'trust.stateProtected',
    descKey:          'trust.stateProtectedDesc',
    colorClass:       'text-sky-300 border-sky-500/25 bg-sky-500/10',
    severity:         'safe',
    recommendedSheet: 'privacy',
  },
  ready: {
    state:            'ready',
    labelKey:         'trust.stateReady',
    descKey:          'trust.stateReadyDesc',
    colorClass:       'text-teal-300 border-teal-500/25 bg-teal-500/10',
    severity:         'safe',
    recommendedSheet: 'delivery',
  },
  allowed: {
    state:            'allowed',
    labelKey:         'trust.stateAllowed',
    descKey:          'trust.stateAllowedDesc',
    colorClass:       'text-emerald-300 border-emerald-500/25 bg-emerald-500/10',
    severity:         'safe',
    recommendedSheet: 'consent',
  },
  pending: {
    state:            'pending',
    labelKey:         'trust.statePending',
    descKey:          'trust.statePendingDesc',
    colorClass:       'text-amber-300 border-amber-500/25 bg-amber-500/10',
    severity:         'caution',
    recommendedSheet: 'consent',
  },
  blocked: {
    state:            'blocked',
    labelKey:         'trust.stateBlocked',
    descKey:          'trust.stateBlockedDesc',
    colorClass:       'text-red-300 border-red-500/25 bg-red-500/10',
    severity:         'danger',
    recommendedSheet: 'consent',
  },
  unknown: {
    state:            'unknown',
    labelKey:         'trust.stateUnknown',
    descKey:          'trust.stateUnknownDesc',
    colorClass:       'text-zinc-400 border-zinc-500/25 bg-zinc-500/10',
    severity:         'neutral',
    recommendedSheet: 'trust',
  },
};

export function getAccessStateMeta(state: ConversationAccessState): AccessStateMeta {
  return ACCESS_STATE_META[state];
}
