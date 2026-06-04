/**
 * EarthOS Consent + Permissions Engine — Layer 11
 *
 * Enforces who can contact, invite, relay, and interact based on:
 *   - Trust level (self / trusted / known / community / unknown / blocked)
 *   - Conversation type (direct / group / project / event / place / cause / council / support_circle)
 *   - Per-conversation sovereignty settings (toggles, requireApproval, isBlocked)
 *   - Relay sovereignty (storageMode, recipient availability)
 *   - Prototype mode (simulated/local-only members always allowed locally)
 *
 * All decisions are non-destructive: a 'pending' result creates the message
 * locally but marks it awaiting approval. A 'blocked' result prevents creation.
 *
 * Backward-compatible: validateConsent() and buildDefaultConsentMatrix() are kept.
 */

import type {
  ConsentMatrix,
  ConsentStatus,
  TrustLevel,
  ConversationType,
  ConversationSovereigntySettings,
} from './types';

// ─── Core decision type ───────────────────────────────────────────────────────

export type ConsentDecisionCode =
  | 'self'                      // sender is the viewer
  | 'allowed'                   // consent granted
  | 'allowed_local_prototype'   // simulated/local member — allowed in prototype mode
  | 'pending_approval'          // requireApproval is set — message created as pending
  | 'pending_trust'             // trust level requires a request (e.g. unknown → direct)
  | 'blocked_conversation'      // isBlocked flag on conversation
  | 'blocked_trust'             // trust level is blocked
  | 'blocked_direct_disabled'   // direct messages disabled
  | 'blocked_project_disabled'  // project invites disabled
  | 'blocked_event_disabled'    // event invites disabled
  | 'blocked_place_disabled'    // location messages disabled
  | 'blocked_no_consent'        // no consent rule matched — blocked by default
  | 'relay_no_recipient'        // relay requires a recipient — none found
  | 'relay_local_only'          // storageMode is local_only — relay not applicable
  | 'invite_blocked'            // invite consent denied
  | 'invite_pending';           // invite requires approval

export interface ConsentDecision {
  allowed: boolean;
  pending: boolean;
  blocked: boolean;
  code: ConsentDecisionCode;
  reason: string;
  /** True when the message can still be saved locally even if relay is blocked */
  localFallback: boolean;
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface MessageConsentInput {
  convSettings: ConversationSovereigntySettings;
  conversationType: ConversationType;
  senderTrustLevel: TrustLevel;
  isSelf: boolean;
  /** True when the sender's EarthID is a local/simulated identity */
  isSenderLocal: boolean;
  consentMatrix?: ConsentMatrix;
}

export interface InviteConsentInput {
  convSettings: ConversationSovereigntySettings;
  conversationType: ConversationType;
  inviteeTrustLevel: TrustLevel;
  /** True when invitee is a local/simulated identity */
  isInviteeLocal: boolean;
  consentMatrix?: ConsentMatrix;
}

export interface RelayConsentInput {
  storageMode: ConversationSovereigntySettings['storageMode'];
  recipientCount: number;
  senderTrustLevel: TrustLevel;
  hasRecipients: boolean;
}

// ─── Message consent ──────────────────────────────────────────────────────────

export function evaluateMessageConsent(input: MessageConsentInput): ConsentDecision {
  const { convSettings, conversationType, senderTrustLevel, isSelf, isSenderLocal } = input;

  // Self messages always allowed
  if (isSelf) {
    return decision('allowed', true, false, false, 'self', 'Sender is the viewer — always allowed.');
  }

  // Local/simulated senders are allowed in prototype mode (local store only)
  if (isSenderLocal) {
    return decision('allowed_local_prototype', true, false, false, 'allowed_local_prototype',
      'Simulated local identity — allowed in local prototype mode. No relay.');
  }

  // Hard block: conversation explicitly blocked
  if (convSettings.isBlocked) {
    return decision('blocked_conversation', false, false, true, 'blocked_conversation',
      'This conversation is blocked. No messages can be sent.');
  }

  // Hard block: trust level is blocked
  if (senderTrustLevel === 'blocked' || convSettings.trustLevel === 'blocked') {
    return decision('blocked_trust', false, false, true, 'blocked_trust',
      'Trust level is blocked. Messaging is paused.');
  }

  // Hard block: type-specific toggles
  if (!convSettings.allowDirectMessages && conversationType === 'direct') {
    return decision('blocked_direct_disabled', false, false, true, 'blocked_direct_disabled',
      'Direct messages are disabled for this conversation.');
  }
  if (!convSettings.allowProjectInvites && conversationType === 'project') {
    return decision('blocked_project_disabled', false, false, true, 'blocked_project_disabled',
      'Project invites are disabled. Enable them in consent settings.');
  }
  if (!convSettings.allowEventInvites && conversationType === 'event') {
    return decision('blocked_event_disabled', false, false, true, 'blocked_event_disabled',
      'Event invites are disabled. Enable them in consent settings.');
  }
  if (!convSettings.allowLocationMessages && conversationType === 'place') {
    return decision('blocked_place_disabled', false, false, true, 'blocked_place_disabled',
      'Location-based messages are disabled. Enable them in consent settings.');
  }

  // Trust-level gating for direct messages
  if (conversationType === 'direct') {
    const matrix = input.consentMatrix;
    if (matrix) {
      if (matrix.allowDirectFrom.includes(senderTrustLevel)) {
        // fall through to approval check below
      } else if (matrix.requireRequestFrom.includes(senderTrustLevel)) {
        return decision('pending_trust', false, true, false, 'pending_trust',
          'A message request is required from this trust level before direct messaging.');
      } else {
        return decision('blocked_no_consent', false, false, true, 'blocked_no_consent',
          'No consent rule permits direct messages from this trust level.');
      }
    } else {
      // No matrix: trusted is allowed, known requires request, others blocked
      if (senderTrustLevel === 'trusted') {
        // fall through
      } else if (senderTrustLevel === 'known' || senderTrustLevel === 'community') {
        return decision('pending_trust', false, true, false, 'pending_trust',
          'A message request is required from this trust level.');
      } else if (senderTrustLevel === 'unknown') {
        return decision('blocked_no_consent', false, false, true, 'blocked_no_consent',
          'Unknown senders cannot send direct messages without consent.');
      }
    }
  }

  // Community/group contexts — community and above are allowed
  const sharedSpaceTypes: ConversationType[] = [
    'group', 'project', 'event', 'place', 'cause', 'council', 'support_circle',
  ];
  if (sharedSpaceTypes.includes(conversationType)) {
    const communityAllowed: TrustLevel[] = ['self', 'trusted', 'known', 'community'];
    if (!communityAllowed.includes(senderTrustLevel)) {
      return decision('pending_trust', false, true, false, 'pending_trust',
        'Unknown senders must submit a request to join this conversation.');
    }
  }

  // Soft gate: requireApproval
  if (convSettings.requireApproval) {
    return decision('pending_approval', false, true, false, 'pending_approval',
      'Messages require approval before delivery. Message created as pending.');
  }

  return decision('allowed', true, false, false, 'allowed', 'Consent granted.');
}

// ─── Invite consent ───────────────────────────────────────────────────────────

export function evaluateInviteConsent(input: InviteConsentInput): ConsentDecision {
  const { convSettings, conversationType, inviteeTrustLevel, isInviteeLocal, consentMatrix } = input;

  // Local/simulated identities — always allowed locally
  if (isInviteeLocal) {
    return decision('allowed_local_prototype', true, false, false, 'allowed_local_prototype',
      'Simulated local identity — invite allowed in local prototype mode.');
  }

  // Hard blocks
  if (convSettings.isBlocked) {
    return decision('invite_blocked', false, false, true, 'invite_blocked',
      'Conversation is blocked. Cannot invite members.');
  }
  if (inviteeTrustLevel === 'blocked') {
    return decision('invite_blocked', false, false, true, 'invite_blocked',
      'Blocked trust level — cannot invite this identity.');
  }

  if (consentMatrix) {
    // Group/project invites
    if (
      (conversationType === 'project' && !consentMatrix.allowProjectInviteFrom.includes(inviteeTrustLevel)) ||
      (conversationType === 'event' && !consentMatrix.allowEventInviteFrom.includes(inviteeTrustLevel)) ||
      (['group', 'council', 'support_circle', 'cause'].includes(conversationType) &&
        !consentMatrix.allowGroupInviteFrom.includes(inviteeTrustLevel))
    ) {
      return decision('invite_pending', false, true, false, 'invite_pending',
        'Invite requires approval for this trust level in this conversation type.');
    }
  }

  return decision('allowed', true, false, false, 'allowed', 'Invite consent granted.');
}

// ─── Relay consent ────────────────────────────────────────────────────────────

export function evaluateRelayConsent(input: RelayConsentInput): ConsentDecision {
  const { storageMode, hasRecipients } = input;

  if (storageMode === 'local_only') {
    return decision('relay_local_only', true, false, false, 'relay_local_only',
      'Storage mode is local_only — relay not applicable. Message stays on this device.');
  }

  if (!hasRecipients) {
    return decision('relay_no_recipient', false, false, false, 'relay_no_recipient',
      'No recipients found. Message held locally until a recipient joins.');
  }

  return decision('allowed', true, false, false, 'allowed',
    'Relay consent granted. Envelope will be sent when relay channel connects.');
}

// ─── Multi-type QA evaluator ──────────────────────────────────────────────────

export interface ConsentScenario {
  conversationType: ConversationType;
  decision: ConsentDecision;
}

export function evaluateConsentAcrossTypes(
  convSettings: ConversationSovereigntySettings,
  senderTrustLevel: TrustLevel,
  consentMatrix?: ConsentMatrix
): ConsentScenario[] {
  const types: ConversationType[] = [
    'direct', 'group', 'project', 'event', 'place',
    'council', 'cause', 'support_circle',
  ];
  return types.map((t) => ({
    conversationType: t,
    decision: evaluateMessageConsent({
      convSettings: { ...convSettings, allowDirectMessages: true, allowProjectInvites: true, allowEventInvites: true, allowLocationMessages: true },
      conversationType: t,
      senderTrustLevel,
      isSelf: false,
      isSenderLocal: false,
      consentMatrix,
    }),
  }));
}

// ─── Backward-compatible helpers ──────────────────────────────────────────────

export interface ConsentCheckInput {
  senderTrustLevel: TrustLevel;
  conversationType: ConversationType;
  consentMatrix: ConsentMatrix;
  isSelf: boolean;
}

export interface ConsentCheckResult {
  passed: boolean;
  status: ConsentStatus;
  reason?: string;
}

/** Kept for backward compatibility with existing call sites. */
export function validateConsent(input: ConsentCheckInput): ConsentCheckResult {
  const decision = evaluateMessageConsent({
    convSettings: {
      conversationId: '',
      storageMode: 'local_only',
      trustLevel: input.senderTrustLevel,
      allowDirectMessages: true,
      requireApproval: false,
      allowProjectInvites: true,
      allowEventInvites: true,
      allowLocationMessages: true,
      isMuted: false,
      isBlocked: false,
      updatedAt: '',
    },
    conversationType: input.conversationType,
    senderTrustLevel: input.senderTrustLevel,
    isSelf: input.isSelf,
    isSenderLocal: false,
    consentMatrix: input.consentMatrix,
  });
  return {
    passed: decision.allowed,
    status: decision.pending ? 'pending' : decision.blocked ? 'blocked' : 'allowed',
    reason: decision.reason,
  };
}

export function buildDefaultConsentMatrix(earthId: string): ConsentMatrix {
  return {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `cm-${Date.now()}`,
    earthId,
    allowDirectFrom: ['trusted'],
    requireRequestFrom: ['known', 'community'],
    allowGroupInviteFrom: ['trusted', 'known'],
    allowEventInviteFrom: ['trusted', 'known', 'community'],
    allowProjectInviteFrom: ['trusted', 'known'],
    allowContributionRequestFrom: ['trusted'],
    updatedAt: new Date().toISOString(),
  };
}

// ─── Internal helper ──────────────────────────────────────────────────────────

function decision(
  code: ConsentDecisionCode,
  allowed: boolean,
  pending: boolean,
  blocked: boolean,
  _unusedCode: ConsentDecisionCode,
  reason: string
): ConsentDecision {
  return {
    allowed,
    pending,
    blocked,
    code,
    reason,
    localFallback: !blocked,
  };
}
