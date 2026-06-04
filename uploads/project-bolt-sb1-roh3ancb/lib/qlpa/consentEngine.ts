// ─── QLPA Consent Engine ──────────────────────────────────────────────────────
//
// Central permission check for all user-initiated actions.
// Wraps the lower-level consent.ts evaluators with a unified action-based API.
//
// Usage:
//   const result = checkPermission('send-message', { ... context ... });
//   if (!result.allowed) showBlockedFeedback(result.reason);

export {
  evaluateMessageConsent,
  evaluateRelayConsent,
  evaluateInviteConsent,
  buildDefaultConsentMatrix,
} from '@/lib/messaging/consent';

export type {
  ConsentDecision,
  ConsentDecisionCode,
  MessageConsentInput,
  InviteConsentInput,
  RelayConsentInput,
} from '@/lib/messaging/consent';

// ─── Action permission map ────────────────────────────────────────────────────
// Enumerates every user action that requires a consent check.
// This is the canonical list — any new action should be added here first.
//
// CommunicationKind → ConsentAction mapping (for envelope gate wiring in Pass 116+):
//   text                  → send-message
//   voice                 → upload-file + send-message (two gates)
//   photo                 → upload-file + send-message
//   video                 → upload-file + send-message
//   file                  → upload-file + send-message
//   location              → share-location + send-message
//   call                  → start-call   (placeholder — action not yet live)
//   reaction              → send-message
//   system / proposal / ritual → send-message (elevated gates may apply per context)

export type ConsentAction =
  | 'send-message'
  | 'create-local-test-message'  // pre-MVP only — local-only, no relay, no trust gate
  | 'invite-member'
  | 'export-data'
  | 'clear-data'
  | 'change-trust'
  | 'change-retention'
  | 'enable-relay'
  | 'upload-file'
  | 'share-location'
  | 'start-call';    // placeholder — not yet enforced; reserved for call feature

// ─── Minimum trust level required per action ─────────────────────────────────
// Actions that are always self-only (data management) require 'self'.
// Social actions require at least 'known'.
// 'create-local-test-message': always allowed (self), local-only, no relay.

import type { TrustLevel } from '@/lib/messaging/types';
import { trustMeetsMinimum } from './trustGraph';

export const ACTION_MIN_TRUST: Record<ConsentAction, TrustLevel> = {
  'send-message':               'known',
  'create-local-test-message':  'self',  // always allowed — local-only, no relay, no recipient required
  'invite-member':              'known',
  'export-data':                'self',
  'clear-data':                 'self',
  'change-trust':               'self',
  'change-retention':           'self',
  'enable-relay':               'self',
  'upload-file':                'known',
  'share-location':             'trusted',
  'start-call':                 'trusted', // calls require explicit mutual trust — higher bar than text
} as const;

export function canPerformAction(
  action: ConsentAction,
  effectiveTrust: TrustLevel
): boolean {
  const min = ACTION_MIN_TRUST[action];
  return trustMeetsMinimum(effectiveTrust, min);
}

// ─── Result type ─────────────────────────────────────────────────────────────

export interface ActionPermissionResult {
  allowed: boolean;
  reason: string;
  requiredTrust?: TrustLevel;
  actualTrust?: TrustLevel;
}

export function checkActionPermission(
  action: ConsentAction,
  effectiveTrust: TrustLevel
): ActionPermissionResult {
  const allowed = canPerformAction(action, effectiveTrust);
  if (allowed) {
    return { allowed: true, reason: 'Permission granted.' };
  }
  return {
    allowed: false,
    reason: `Action '${action}' requires trust level '${ACTION_MIN_TRUST[action]}', but current trust is '${effectiveTrust}'.`,
    requiredTrust: ACTION_MIN_TRUST[action],
    actualTrust:   effectiveTrust,
  };
}
