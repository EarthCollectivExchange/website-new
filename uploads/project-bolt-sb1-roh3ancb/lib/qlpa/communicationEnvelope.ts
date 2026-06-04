// ─── QLPA Communication Envelope ─────────────────────────────────────────────
//
// Universal wrapper for every communication object in EarthOS.
// Every kind — text, voice, photo, video, file, location, call, reaction,
// system event — passes through the same lifecycle:
//
//   Consent → Protection → Local storage → Optional relay → Retention → Audit
//
// Design rules:
//   - The envelope defines structure and lifecycle. It does NOT store content.
//   - All content fields in EnvelopeBody are optional references (URIs, blob IDs)
//     never raw bytes.
//   - Private messages are NOT planetary statistics. Only an explicit user
//     action can promote a private communication into a public EarthOS signal.
//   - Do not add database calls, network calls, or UI code here.
//   - Adapters from existing Message type live at the bottom of this file.

import type { MessageLifecycleState } from './messageLifecycle';
import type { Conversation } from '@/lib/messaging/types';
import type { Message } from '@/lib/messaging/types';

// ─── Communication kinds ──────────────────────────────────────────────────────

export type CommunicationKind =
  | 'text'       // text message — the baseline kind
  | 'voice'      // voice note / audio message
  | 'photo'      // single image
  | 'video'      // video clip
  | 'file'       // generic file attachment
  | 'location'   // geographic location pin or live share
  | 'reaction'   // emoji/signal reaction to another message
  | 'call'       // voice or video call event (start/end record)
  | 'system'     // system-generated event (member joined, settings changed)
  | 'proposal'   // governance proposal or consent request
  | 'ritual';    // EarthOS ritual signal (ceremony, affirmation, acknowledgement)

// ─── Consent state ────────────────────────────────────────────────────────────
// Resolved by the consent engine before the envelope is created.

export type EnvelopeConsentState =
  | 'allowed'   // consent granted — proceed
  | 'waiting'   // pending approval or trust establishment
  | 'blocked'   // consent denied — envelope should not be created
  | 'revoked';  // previously allowed; consent was withdrawn post-creation

// ─── Protection state ─────────────────────────────────────────────────────────
// Tracks the encryption/protection posture of the content.

export type EnvelopeProtectionState =
  | 'local-prototype'  // unencrypted; local-only prototype mode (dev/demo)
  | 'sealed'           // client-side encrypted; key never leaves device
  | 'production-e2ee'  // full E2EE; relay cannot read content (future)
  | 'blocked';         // protection check failed; envelope should not be relayed

// ─── Delivery state ───────────────────────────────────────────────────────────

export type EnvelopeDeliveryState =
  | 'local'     // stored locally; no relay attempted
  | 'queued'    // queued for relay; waiting for connection
  | 'ready'     // relay-ready; will send on next opportunity
  | 'relayed'   // relay server has accepted the envelope
  | 'delivered' // recipient device has acknowledged receipt
  | 'failed';   // delivery failed; may be retried

// ─── Retention mode ───────────────────────────────────────────────────────────

export type EnvelopeRetentionMode =
  | 'manual'      // user clears manually; no auto-expiry
  | 'auto-clear'  // expires after a configured duration
  | 'archive'     // user opted into long-term encrypted archive
  | 'view-once'   // visible once; cleared after first read
  | 'expired';    // retention period has elapsed; content cleared

// ─── Envelope body ────────────────────────────────────────────────────────────
// Content references only. Never raw bytes, never unencrypted content.

export interface EnvelopeBody {
  mimeType: string;
  textPreview?: string;       // first N chars of text, for search/notification (stripped if sensitive)
  localUri?: string;          // local file:// or blob: URI for media
  encryptedBlobId?: string;   // ID of encrypted blob in local store or relay cache
  sizeBytes?: number;
  durationMs?: number;        // voice/video duration
  width?: number;             // image/video dimensions
  height?: number;
  filename?: string;          // original filename for file attachments
  waveformPreview?: number[]; // normalised waveform samples (0–1) for voice playback UI
  thumbnailUri?: string;      // local URI to thumbnail for photo/video
}

// ─── Audit record ─────────────────────────────────────────────────────────────

export interface EnvelopeAudit {
  ledgerEventIds: string[];        // IDs of all ledger events emitted for this envelope
  integrityHash?: string;          // hash of (body + senderId + createdAt) at creation time
  lifecycleState: MessageLifecycleState;
}

// ─── The envelope ─────────────────────────────────────────────────────────────

export interface QLPACommunicationEnvelope {
  id: string;
  conversationId: string;
  senderId: string;
  createdAt: string; // ISO 8601
  kind: CommunicationKind;
  consent: EnvelopeConsentState;
  protection: EnvelopeProtectionState;
  delivery: EnvelopeDeliveryState;
  retention: EnvelopeRetentionMode;
  body: EnvelopeBody;
  audit: EnvelopeAudit;
}

// ─── Adapter: Message → QLPACommunicationEnvelope ─────────────────────────────
// Safe bridge from the existing Message type to the envelope model.
// Does not modify Message. Does not write to any store.

export function createTextEnvelopeFromMessage(
  message: Message,
  conversation: Conversation,
): QLPACommunicationEnvelope {
  const lifecycleState: MessageLifecycleState =
    message.deleteStatus === 'local_deleted' ? 'cleared' :
    message.deleteStatus === 'expired'       ? 'cleared'  :
    message.encryptionStatus === 'local_encrypted' ? 'stored_local' :
    'stored_local';

  return {
    id:             message.id,
    conversationId: message.conversationId,
    senderId:       message.senderId,
    createdAt:      message.createdAt,
    kind:           'text',
    consent:        'allowed',
    protection:     message.encryptionStatus === 'local_encrypted' ? 'sealed' : 'local-prototype',
    delivery:       conversation.storageMode === 'local_only' ? 'local' : 'ready',
    retention:      message.expiresAt ? 'auto-clear' : 'manual',
    body: {
      mimeType:    'text/plain',
      textPreview: message.body?.slice(0, 80),
    },
    audit: {
      ledgerEventIds: [],
      integrityHash:  message.integrityHash ?? undefined,
      lifecycleState,
    },
  };
}

// ─── Adapter: envelope → lifecycle state ─────────────────────────────────────

export function envelopeToLifecycleState(
  envelope: QLPACommunicationEnvelope,
): MessageLifecycleState {
  return envelope.audit.lifecycleState;
}

// ─── Display kind helper ──────────────────────────────────────────────────────
// Returns the i18n key for the communication kind label.

export function getEnvelopeDisplayKind(envelope: QLPACommunicationEnvelope): string {
  const kindKeyMap: Record<CommunicationKind, string> = {
    text:     'envelope.kindText',
    voice:    'envelope.kindVoice',
    photo:    'envelope.kindPhoto',
    video:    'envelope.kindVideo',
    file:     'envelope.kindFile',
    location: 'envelope.kindLocation',
    reaction: 'envelope.kindReaction',
    call:     'envelope.kindCall',
    system:   'envelope.kindSystem',
    proposal: 'envelope.kindProposal',
    ritual:   'envelope.kindRitual',
  };
  return kindKeyMap[envelope.kind];
}
