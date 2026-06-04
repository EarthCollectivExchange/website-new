// ─── QLPA Abuse Taxonomy ──────────────────────────────────────────────────────
//
// Canonical harm vocabulary for the EarthOS Shield system.
//
// Scope rules:
//   - Private direct messages are NEVER silently scanned.
//   - Group/community/broadcast/public spaces may apply Shield gates based on
//     trust level, link/media policies, and user-submitted reports.
//   - Classification is initiated only by an explicit user report action.
//   - No behavioral fingerprinting. No passive content monitoring.
//
// Categories with requiresEscalation: true must be flagged for human review
// and, after legal sign-off, routed to appropriate reporting authorities.
// DO NOT activate escalation pipelines without legal review.
//
// Communication without extraction also means communication without predation.

// ─── Severity ─────────────────────────────────────────────────────────────────

export type AbuseSeverity = 'low' | 'medium' | 'high' | 'critical';

// ─── Categories ───────────────────────────────────────────────────────────────

export type AbuseCategory =
  | 'spam-bot'
  | 'scam'
  | 'malicious-link'
  | 'adult-sexual'
  | 'sexual-violence'
  | 'non-consensual-content'
  | 'child-safety'
  | 'harassment'
  | 'hate'
  | 'self-harm'
  | 'illegal-goods'
  | 'unknown';

// AbuseReportReason is a user-facing alias — same type, different intent.
// 'unknown' is valid: users may not be able to classify harm precisely.
export type AbuseReportReason = AbuseCategory;

// ─── Category metadata ────────────────────────────────────────────────────────

export interface AbuseCategoryMeta {
  category: AbuseCategory;
  severity: AbuseSeverity;
  /**
   * True when this category must be flagged for legal/trust-and-safety escalation.
   * PRODUCTION NOTE: Do not activate escalation without legal sign-off and
   * explicit informed consent from the reporting user.
   */
  requiresEscalation: boolean;
  /** i18n key for the display label shown to the reporting user. */
  labelKey: string;
  /** i18n key for the short description shown in the report UI. */
  descKey: string;
}

export const ABUSE_CATEGORY_META: Record<AbuseCategory, AbuseCategoryMeta> = {
  'spam-bot': {
    category:           'spam-bot',
    severity:           'medium',
    requiresEscalation: false,
    labelKey:           'shield.spamBot',
    descKey:            'shield.spamBotDesc',
  },
  scam: {
    category:           'scam',
    severity:           'high',
    requiresEscalation: false,
    labelKey:           'shield.scam',
    descKey:            'shield.scamDesc',
  },
  'malicious-link': {
    category:           'malicious-link',
    severity:           'high',
    requiresEscalation: false,
    labelKey:           'shield.harmfulLink',
    descKey:            'shield.harmfulLinkDesc',
  },
  'adult-sexual': {
    category:           'adult-sexual',
    severity:           'high',
    requiresEscalation: false,
    labelKey:           'shield.adultSexual',
    descKey:            'shield.adultSexualDesc',
  },
  'sexual-violence': {
    category:           'sexual-violence',
    severity:           'critical',
    requiresEscalation: true,
    labelKey:           'shield.sexualViolence',
    descKey:            'shield.sexualViolenceDesc',
  },
  'non-consensual-content': {
    category:           'non-consensual-content',
    severity:           'high',
    requiresEscalation: true,
    labelKey:           'shield.nonConsensualContent',
    descKey:            'shield.nonConsensualContentDesc',
  },
  'child-safety': {
    category:           'child-safety',
    severity:           'critical',
    requiresEscalation: true,
    labelKey:           'shield.childSafetyConcern',
    descKey:            'shield.childSafetyConcernDesc',
  },
  harassment: {
    category:           'harassment',
    severity:           'medium',
    requiresEscalation: false,
    labelKey:           'shield.harassment',
    descKey:            'shield.harassmentDesc',
  },
  hate: {
    category:           'hate',
    severity:           'high',
    requiresEscalation: false,
    labelKey:           'shield.hate',
    descKey:            'shield.hateDesc',
  },
  'self-harm': {
    category:           'self-harm',
    severity:           'high',
    requiresEscalation: false,
    labelKey:           'shield.selfHarm',
    descKey:            'shield.selfHarmDesc',
  },
  'illegal-goods': {
    category:           'illegal-goods',
    severity:           'high',
    requiresEscalation: false,
    labelKey:           'shield.illegalGoods',
    descKey:            'shield.illegalGoodsDesc',
  },
  unknown: {
    category:           'unknown',
    severity:           'low',
    requiresEscalation: false,
    labelKey:           'shield.unknownConcern',
    descKey:            'shield.unknownConcernDesc',
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getAbuseMeta(category: AbuseCategory): AbuseCategoryMeta {
  return ABUSE_CATEGORY_META[category];
}
