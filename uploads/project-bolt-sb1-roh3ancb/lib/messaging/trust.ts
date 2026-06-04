import type { TrustLevel, TrustRelationship } from './types';

export interface TrustCheckInput {
  fromEarthId: string;
  toEarthId: string;
  relationships: TrustRelationship[];
}

export interface TrustCheckResult {
  passed: boolean;
  effectiveLevel: TrustLevel;
  reason?: string;
}

// Returns the trust level from one EarthID toward another
export function resolveTrustLevel(
  fromEarthId: string,
  toEarthId: string,
  relationships: TrustRelationship[]
): TrustLevel {
  if (fromEarthId === toEarthId) return 'self';

  const rel = relationships.find(
    (r) => r.fromEarthId === fromEarthId && r.toEarthId === toEarthId
  );

  return rel?.level ?? 'unknown';
}

export function validateTrustLevel(input: TrustCheckInput): TrustCheckResult {
  const { fromEarthId, toEarthId, relationships } = input;

  const level = resolveTrustLevel(fromEarthId, toEarthId, relationships);

  if (level === 'blocked') {
    return {
      passed: false,
      effectiveLevel: 'blocked',
      reason: 'Recipient has blocked this EarthID.',
    };
  }

  return { passed: true, effectiveLevel: level };
}

// Trust routing rules — what each level permits
export const TRUST_ROUTING: Record<TrustLevel, string> = {
  self: 'Full access — same identity',
  trusted: 'Direct message allowed',
  known: 'Message request required',
  community: 'Limited context message in shared space',
  unknown: 'Request only — rate limited',
  blocked: 'No access, no visibility',
};
