// ─── QLPA Shield Policy ───────────────────────────────────────────────────────
//
// Per-space shield levels and recommended action logic.
//
// Shield levels determine what restrictions apply to a conversation space.
// They are set per ConversationType — not per user — and are the operator's
// default posture before any user-level trust overrides are applied.
//
// Level definitions:
//   off        — no Shield activity; direct/private 1:1 spaces
//   basic      — light spam/link detection; small trusted groups
//   guarded    — moderate restrictions; community/semi-public spaces
//   circle     — strong link/media restrictions; support/sensitive spaces
//   child-safe — maximum restrictions; spaces serving minors
//   high-risk  — active escalation posture; reserved for acute crisis situations
//
// IMPORTANT: Production deployment of 'circle' and above requires legal
// review and alignment with applicable child protection, CSAM, DSA, and
// CyberTipline reporting obligations.
// Do not activate automatic escalation without legal sign-off.
//
// Communication without extraction also means communication without predation.

import type { AbuseCategory, AbuseSeverity } from './abuseTaxonomy';
import { ABUSE_CATEGORY_META } from './abuseTaxonomy';
import type { ConversationType } from '@/lib/messaging/types';

// ─── Shield levels ────────────────────────────────────────────────────────────

export type ShieldLevel =
  | 'off'
  | 'basic'
  | 'guarded'
  | 'circle'
  | 'child-safe'
  | 'high-risk';

// ─── Recommended shield actions ───────────────────────────────────────────────

export type RecommendedShieldAction =
  | 'allow'      // no action — content passes
  | 'warn'       // show sender a caution notice
  | 'hold'       // hold for human review before delivery
  | 'hide'       // deliver but hide from recipients pending review
  | 'block'      // block delivery entirely
  | 'escalate';  // block + flag for legal/trust-and-safety escalation

// ─── Shield policy per space ──────────────────────────────────────────────────

export interface ShieldPolicy {
  level: ShieldLevel;
  /** Whether unknown/unverified actors may post links. */
  allowUnknownLinks: boolean;
  /** Whether unknown/unverified actors may post media or files. */
  allowUnknownMedia: boolean;
  /** Whether a minimum trust level is required to post media. */
  requireTrustForMedia: boolean;
  /** Auto-hide content when a report is submitted by any member. */
  autoHideOnReport: boolean;
}

// ─── Default policies by conversation type ────────────────────────────────────
// Direct messages are fully private; no silent scanning is applied.

export const DEFAULT_SHIELD_POLICIES: Record<ConversationType, ShieldPolicy> = {
  direct: {
    level:                'off',
    allowUnknownLinks:    true,
    allowUnknownMedia:    true,
    requireTrustForMedia: false,
    autoHideOnReport:     false,
  },
  group: {
    level:                'basic',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     false,
  },
  project: {
    level:                'basic',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     false,
  },
  event: {
    level:                'guarded',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     true,
  },
  council: {
    level:                'guarded',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     true,
  },
  support_circle: {
    level:                'circle',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     true,
  },
  cause: {
    level:                'guarded',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     true,
  },
  place: {
    level:                'guarded',
    allowUnknownLinks:    false,
    allowUnknownMedia:    false,
    requireTrustForMedia: true,
    autoHideOnReport:     true,
  },
};

// ─── Action recommendation logic ─────────────────────────────────────────────
// Maps (AbuseCategory, ShieldLevel) → RecommendedShieldAction.
// Critical / requiresEscalation categories always escalate, regardless of level.

const SEVERITY_RANK: Record<AbuseSeverity, number> = {
  low:      0,
  medium:   1,
  high:     2,
  critical: 3,
};

export function getRecommendedAction(
  category: AbuseCategory,
  level: ShieldLevel,
): RecommendedShieldAction {
  const meta = ABUSE_CATEGORY_META[category];

  if (meta.requiresEscalation) return 'escalate';

  if (level === 'off') return 'allow';

  const rank = SEVERITY_RANK[meta.severity];

  if (level === 'basic') {
    if (rank >= 2) return 'block';
    if (rank === 1) return 'warn';
    return 'allow';
  }

  if (level === 'guarded') {
    if (rank >= 2) return 'hide';
    if (rank === 1) return 'hold';
    return 'warn';
  }

  if (level === 'circle') {
    if (rank >= 2) return 'block';
    if (rank >= 1) return 'hold';
    return 'hold';
  }

  if (level === 'child-safe') {
    if (rank >= 1) return 'block';
    return 'hold';
  }

  // 'high-risk'
  return 'escalate';
}

// ─── Envelope kind → shield category ─────────────────────────────────────────
// Maps a CommunicationKind to a broad shield category used for policy routing.
// Does NOT scan content. Purely structural classification.
//
// Shield categories:
//   text      — text/link screening path
//   media     — image/video/audio screening path (size, format, trust gate)
//   file      — file transfer screening path (extension, size gate)
//   location  — geographic data path (proximity disclosure rules)
//   live      — real-time session path (call, future AR/VR)
//   system    — system-generated events (no user content to screen)

export type EnvelopeShieldCategory =
  | 'text'
  | 'media'
  | 'file'
  | 'location'
  | 'live'
  | 'system';

// CommunicationKind imported via the envelope module — avoid circular by using a string parameter
// typed to the CommunicationKind union. This keeps shieldPolicy free of circular imports.
export type CommunicationKindForShield =
  | 'text' | 'voice' | 'photo' | 'video' | 'file'
  | 'location' | 'reaction' | 'call' | 'system' | 'proposal' | 'ritual';

export function getShieldCategoryForEnvelopeKind(
  kind: CommunicationKindForShield,
): EnvelopeShieldCategory {
  switch (kind) {
    case 'text':
    case 'reaction':
    case 'proposal':
    case 'ritual':
      return 'text';
    case 'voice':
    case 'photo':
    case 'video':
      return 'media';
    case 'file':
      return 'file';
    case 'location':
      return 'location';
    case 'call':
      return 'live';
    case 'system':
      return 'system';
  }
}
