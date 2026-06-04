/**
 * EarthOS Relay Boundary — Layer 7 / 8
 *
 * PLACEHOLDER — NO LIVE RELAY YET.
 *
 * This module defines the relay envelope structure that will carry encrypted
 * message metadata to a future relay server. It enforces a strict boundary:
 *
 *   - Plaintext message bodies NEVER appear in a relay envelope.
 *   - encryptedPayload is only permitted when storageMode allows it.
 *   - local_only mode envelopes never leave the device — status reflects this.
 *   - recipientEarthIds are resolved from real conversation members (Layer 8).
 *
 * The relay channel itself (WebSocket / Supabase Realtime / custom) is not
 * connected here. This layer purely defines shape, rules, and QA tooling.
 */

import type { Message, MessageEncryptionStatus, ConversationMember } from './types';
import type { ConversationSovereigntySettings } from './types';

// ─── Core types ───────────────────────────────────────────────────────────────

export type RelayMode =
  | 'local_only'        // content stays on device; no relay ever
  | 'encrypted_relay'   // relay carries encrypted payload; plaintext never sent
  | 'encrypted_backup'; // relay + encrypted backup; user opted in

export type RelayDeliveryStatus =
  | 'local_only'       // storageMode is local_only — envelope never sent
  | 'no_recipient'     // no external recipients found in member list
  | 'queued'           // waiting to be relayed (encrypted_backup prototype)
  | 'ready_for_relay'  // envelope ready; relay channel not yet connected
  | 'relay_disabled'   // relay channel disabled or not configured
  | 'failed';          // relay attempt failed

/**
 * RelayEnvelope — the ONLY structure that may cross the device boundary.
 *
 * INVARIANT: `body` must NEVER appear in this type.
 * Plaintext is local-only forever.
 */
export interface RelayEnvelope {
  messageId: string;
  conversationId: string;
  senderEarthId: string;
  recipientEarthIds: string[];   // resolved from conversation members, excluding sender
  storageMode: RelayMode;
  encryptionStatus: MessageEncryptionStatus | 'unknown';
  integrityHash: string;
  createdAt: string;
  deliveryStatus: RelayDeliveryStatus;
  encryptedPayloadAllowed: boolean; // if false, encryptedPayload must never be sent
  isPrototypeEnvelope: boolean;     // always true until relay channel is live
}

// ─── Recipient resolution ─────────────────────────────────────────────────────

/**
 * Derives recipient EarthIDs from conversation members, excluding the sender.
 * Returns an empty array if no other members exist.
 */
export function resolveRecipientEarthIds(
  members: ConversationMember[],
  senderEarthId: string,
  conversationId: string
): string[] {
  return members
    .filter(
      (m) => m.conversationId === conversationId && m.earthId !== senderEarthId
    )
    .map((m) => m.earthId);
}

// ─── Envelope factory ─────────────────────────────────────────────────────────

export interface CreateEnvelopeInput {
  message: Message;
  convSettings: ConversationSovereigntySettings;
  /** Pass resolved recipients. Use resolveRecipientEarthIds() to derive from members. */
  recipientEarthIds?: string[];
}

export function createRelayEnvelope(input: CreateEnvelopeInput): RelayEnvelope {
  const { message, convSettings, recipientEarthIds = [] } = input;
  const storageMode = convSettings.storageMode as RelayMode;
  const hasRecipients = recipientEarthIds.length > 0;

  let deliveryStatus: RelayDeliveryStatus;
  let encryptedPayloadAllowed: boolean;

  switch (storageMode) {
    case 'local_only':
      deliveryStatus = 'local_only';
      encryptedPayloadAllowed = false;
      break;
    case 'encrypted_relay':
      deliveryStatus = hasRecipients ? 'ready_for_relay' : 'no_recipient';
      encryptedPayloadAllowed = true;
      break;
    case 'encrypted_backup':
      deliveryStatus = hasRecipients ? 'queued' : 'no_recipient';
      encryptedPayloadAllowed = true;
      break;
    default:
      deliveryStatus = 'relay_disabled';
      encryptedPayloadAllowed = false;
  }

  return {
    messageId: message.id,
    conversationId: message.conversationId,
    senderEarthId: message.senderId,
    recipientEarthIds,
    storageMode,
    encryptionStatus: message.encryptionStatus ?? 'unknown',
    integrityHash: message.integrityHash,
    createdAt: message.createdAt,
    deliveryStatus,
    encryptedPayloadAllowed,
    isPrototypeEnvelope: true,
  };
}

// ─── QA utilities ─────────────────────────────────────────────────────────────

export interface EnvelopeQAResult {
  passed: boolean;
  checks: EnvelopeQACheck[];
}

export interface EnvelopeQACheck {
  label: string;
  passed: boolean;
  detail: string;
}

/**
 * Verifies that a relay envelope is safe to send:
 * - no `body` field
 * - integrityHash present and non-empty
 * - encryptedPayloadAllowed matches the storageMode rule
 * - messageId and conversationId present
 * - local_only deliveryStatus matches storageMode
 */
export function validateRelayEnvelope(
  envelope: RelayEnvelope,
  originalMessage: Message
): EnvelopeQAResult {
  const checks: EnvelopeQACheck[] = [];

  // 1. Body must not exist in envelope
  const envelopeAsAny = envelope as unknown as Record<string, unknown>;
  const noBody = !('body' in envelopeAsAny) || envelopeAsAny['body'] === undefined;
  checks.push({
    label: 'No plaintext body in envelope',
    passed: noBody,
    detail: noBody
      ? 'Confirmed: envelope contains no body field'
      : 'VIOLATION: body field found in envelope — relay blocked',
  });

  // 2. integrityHash must be present
  const hasHash = Boolean(envelope.integrityHash && envelope.integrityHash.length > 0);
  checks.push({
    label: 'Integrity hash present',
    passed: hasHash,
    detail: hasHash
      ? `Hash: ${envelope.integrityHash.slice(0, 20)}…`
      : 'Missing integrity hash — envelope rejected',
  });

  // 3. encryptedPayloadAllowed matches storageMode
  const expectedAllowed =
    envelope.storageMode === 'encrypted_relay' || envelope.storageMode === 'encrypted_backup';
  const payloadRuleCorrect = envelope.encryptedPayloadAllowed === expectedAllowed;
  checks.push({
    label: 'encryptedPayloadAllowed matches storageMode',
    passed: payloadRuleCorrect,
    detail: payloadRuleCorrect
      ? `storageMode '${envelope.storageMode}' → encryptedPayloadAllowed: ${envelope.encryptedPayloadAllowed}`
      : `Expected ${expectedAllowed} for mode '${envelope.storageMode}', got ${envelope.encryptedPayloadAllowed}`,
  });

  // 4. messageId matches original
  const idMatch = envelope.messageId === originalMessage.id;
  checks.push({
    label: 'messageId matches source message',
    passed: idMatch,
    detail: idMatch ? `ID: ${envelope.messageId}` : 'messageId mismatch',
  });

  // 5. local_only → deliveryStatus must be local_only
  const localStatusCorrect =
    envelope.storageMode !== 'local_only' || envelope.deliveryStatus === 'local_only';
  checks.push({
    label: 'local_only mode stays local',
    passed: localStatusCorrect,
    detail: localStatusCorrect
      ? envelope.storageMode === 'local_only'
        ? 'Envelope marked local_only — will never be relayed'
        : `Mode is '${envelope.storageMode}' — relay allowed`
      : 'local_only message has non-local delivery status',
  });

  const passed = checks.every((c) => c.passed);
  return { passed, checks };
}

// ─── Members QA ───────────────────────────────────────────────────────────────

export interface MembersQAResult {
  viewerEarthId: string;
  totalMembers: number;
  recipientCount: number;
  recipientEarthIds: string[];
  hasRecipients: boolean;
  deliveryReadiness: 'ready' | 'no_recipient' | 'local_only';
  warning: string | null;
}

export function evaluateMembersQA(
  members: ConversationMember[],
  viewerEarthId: string,
  conversationId: string,
  storageMode: RelayMode
): MembersQAResult {
  const conversationMembers = members.filter((m) => m.conversationId === conversationId);
  const recipients = resolveRecipientEarthIds(members, viewerEarthId, conversationId);
  const hasRecipients = recipients.length > 0;

  let deliveryReadiness: MembersQAResult['deliveryReadiness'];
  let warning: string | null = null;

  if (storageMode === 'local_only') {
    deliveryReadiness = 'local_only';
  } else if (!hasRecipients) {
    deliveryReadiness = 'no_recipient';
    warning = 'No external recipients found. Message will be held locally until recipients join.';
  } else {
    deliveryReadiness = 'ready';
  }

  return {
    viewerEarthId,
    totalMembers: conversationMembers.length,
    recipientCount: recipients.length,
    recipientEarthIds: recipients,
    hasRecipients,
    deliveryReadiness,
    warning,
  };
}

// ─── Delivery status helpers ──────────────────────────────────────────────────

export const DELIVERY_STATUS_LABELS: Record<RelayDeliveryStatus, string> = {
  local_only:      'Local only',
  no_recipient:    'No recipient yet',
  queued:          'Queued for relay',
  ready_for_relay: 'Ready for relay',
  relay_disabled:  'Relay disabled',
  failed:          'Relay failed',
};

export const DELIVERY_STATUS_COLORS: Record<RelayDeliveryStatus, string> = {
  local_only:      'text-sky-600',
  no_recipient:    'text-amber-500',
  queued:          'text-amber-500',
  ready_for_relay: 'text-emerald-600',
  relay_disabled:  'text-muted-foreground',
  failed:          'text-destructive',
};

export const DELIVERY_STATUS_BG: Record<RelayDeliveryStatus, string> = {
  local_only:      'bg-sky-50 border-sky-200 text-sky-700',
  no_recipient:    'bg-amber-50 border-amber-200 text-amber-700',
  queued:          'bg-amber-50 border-amber-200 text-amber-700',
  ready_for_relay: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  relay_disabled:  'bg-muted/30 border-border text-muted-foreground',
  failed:          'bg-destructive/5 border-destructive/20 text-destructive',
};
