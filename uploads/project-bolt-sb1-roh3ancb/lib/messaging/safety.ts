import type { SafetyPolicy, TrustLevel } from './types';

export interface SafetyCheckInput {
  senderEarthId: string;
  recipientPolicy: SafetyPolicy;
  trustLevel: TrustLevel;
  recentMessageCount: number; // messages sent by sender in the last hour
}

export interface SafetyCheckResult {
  passed: boolean;
  reason?: string;
}

export interface RateLimitCheckInput {
  senderEarthId: string;
  trustLevel: TrustLevel;
  recentMessageCount: number;
  policy: SafetyPolicy;
}

export interface RateLimitCheckResult {
  passed: boolean;
  reason?: string;
}

export function validateSafetyPolicy(input: SafetyCheckInput): SafetyCheckResult {
  const { senderEarthId, recipientPolicy } = input;

  if (recipientPolicy.blockedEarthIds.includes(senderEarthId)) {
    return {
      passed: false,
      reason: 'Sender is on the recipient safety block list.',
    };
  }

  if (recipientPolicy.mutedEarthIds.includes(senderEarthId)) {
    // Muted does not block — messages arrive silently, not denied
    return { passed: true };
  }

  return { passed: true };
}

export function validateRateLimit(input: RateLimitCheckInput): RateLimitCheckResult {
  const { trustLevel, recentMessageCount, policy } = input;

  if (!policy.rateLimitUnknownSenders) {
    return { passed: true };
  }

  if (trustLevel === 'unknown' || trustLevel === 'community') {
    if (recentMessageCount >= policy.maxMessagesPerHourUnknown) {
      return {
        passed: false,
        reason: `Rate limit reached: maximum ${policy.maxMessagesPerHourUnknown} messages per hour from unknown senders.`,
      };
    }
  }

  return { passed: true };
}

export function buildDefaultSafetyPolicy(earthId: string): SafetyPolicy {
  return {
    id: crypto.randomUUID(),
    earthId,
    blockedEarthIds: [],
    mutedEarthIds: [],
    rateLimitUnknownSenders: true,
    maxMessagesPerHourUnknown: 3,
    maxEmergencySignals: 2,
    reportAbuse: true,
    updatedAt: new Date().toISOString(),
  };
}
