/**
 * Trust Levels
 * Canonical definitions for the trust gradient used throughout a QLPA-aligned host application.
 * Host apps extend these definitions with their own message type implementations.
 */

export type TrustLevelId = 'self' | 'trusted' | 'known' | 'community' | 'unknown' | 'closed' | 'guardian_future';

export interface TrustLevelDefinition {
  id: TrustLevelId;
  labelKey: string;
  descriptionKey: string;
  color: string;
  allowsDirectMessage: boolean;
  requiresRequest: boolean;
  isBlocked: boolean;
  maturity: 'active' | 'future';
}

export const TRUST_LEVEL_DEFINITIONS: TrustLevelDefinition[] = [
  {
    id: 'self',
    labelKey: 'badge.trust.self',
    descriptionKey: 'trust.self',
    color: 'emerald',
    allowsDirectMessage: true,
    requiresRequest: false,
    isBlocked: false,
    maturity: 'active',
  },
  {
    id: 'trusted',
    labelKey: 'badge.trust.trusted',
    descriptionKey: 'trust.trusted',
    color: 'sky',
    allowsDirectMessage: true,
    requiresRequest: false,
    isBlocked: false,
    maturity: 'active',
  },
  {
    id: 'known',
    labelKey: 'badge.trust.known',
    descriptionKey: 'trust.known',
    color: 'teal',
    allowsDirectMessage: false,
    requiresRequest: true,
    isBlocked: false,
    maturity: 'active',
  },
  {
    id: 'community',
    labelKey: 'badge.trust.community',
    descriptionKey: 'trust.community',
    color: 'amber',
    allowsDirectMessage: false,
    requiresRequest: true,
    isBlocked: false,
    maturity: 'active',
  },
  {
    id: 'unknown',
    labelKey: 'badge.trust.unknown',
    descriptionKey: 'trust.unknown',
    color: 'stone',
    allowsDirectMessage: false,
    requiresRequest: true,
    isBlocked: false,
    maturity: 'active',
  },
  {
    id: 'closed',
    labelKey: 'trust.blocked',
    descriptionKey: 'trust.blocked',
    color: 'red',
    allowsDirectMessage: false,
    requiresRequest: false,
    isBlocked: true,
    maturity: 'active',
  },
  {
    id: 'guardian_future',
    labelKey: 'trust.self',
    descriptionKey: 'trust.self',
    color: 'violet',
    allowsDirectMessage: true,
    requiresRequest: false,
    isBlocked: false,
    maturity: 'future',
  },
];

const TRUST_MAP = new Map(TRUST_LEVEL_DEFINITIONS.map((t) => [t.id, t]));

export function getTrustLevel(id: TrustLevelId): TrustLevelDefinition | undefined {
  return TRUST_MAP.get(id);
}

export function getActiveTrustLevels(): TrustLevelDefinition[] {
  return TRUST_LEVEL_DEFINITIONS.filter((t) => t.maturity === 'active');
}
