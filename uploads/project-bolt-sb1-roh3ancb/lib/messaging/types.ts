// EarthOS Messaging — QLPA Core Type Definitions
// Every message must pass six QLPA validations before creation.

// ─── Identity ────────────────────────────────────────────────────────────────

export interface EarthID {
  id: string;
  authUserId: string; // links to Supabase auth.users — technical session key only
  handle: string;     // sovereign public identity handle e.g. @river.nova
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  sovereignSince: string; // ISO timestamp of EarthID creation
  isActive: boolean;
  storagePreference: StorageMode;
  intentionMirrorConfig: IntentionMirror;
  createdAt: string;
  updatedAt: string;
  // Layer 10 — Identity Core
  trustLevel?: TrustLevel;     // viewer's relationship to this identity (resolved at runtime)
  isLocal: boolean;            // true = identity lives only in local store (e.g. simulated/invited)
  keypairPlaceholder?: string; // placeholder for future public key — no crypto yet
}

// ─── Trust Gradient ──────────────────────────────────────────────────────────

export type TrustLevel =
  | 'self'       // same EarthID
  | 'trusted'    // explicit mutual trust — direct messaging allowed
  | 'known'      // one-way acquaintance — message request required
  | 'community'  // shared space (project, event, council) — limited context message
  | 'unknown'    // no relationship — request only, rate-limited
  | 'blocked';   // no access, no visibility

export interface TrustRelationship {
  id: string;
  fromEarthId: string;
  toEarthId: string;
  level: TrustLevel;
  grantedAt: string;
  notes?: string;
}

// ─── Storage Sovereignty ─────────────────────────────────────────────────────

export type StorageMode =
  | 'local_only'        // messages stay on device only — server never holds content
  | 'encrypted_relay'   // server relays encrypted payload, deletes after delivery (default)
  | 'encrypted_backup'; // user opts into encrypted backup — EarthOS cannot read content

// ─── Consent ─────────────────────────────────────────────────────────────────

export interface ConsentMatrix {
  id: string;
  earthId: string;
  allowDirectFrom: TrustLevel[];      // trust levels allowed to send direct messages
  requireRequestFrom: TrustLevel[];   // trust levels that must send a request first
  allowGroupInviteFrom: TrustLevel[];
  allowEventInviteFrom: TrustLevel[];
  allowProjectInviteFrom: TrustLevel[];
  allowContributionRequestFrom: TrustLevel[];
  updatedAt: string;
}

export type ConsentStatus =
  | 'allowed'    // consent validated, message permitted
  | 'pending'    // awaiting message request approval
  | 'blocked'    // consent denied — message not created
  | 'emergency'; // emergency signal, limited and logged

// ─── Safety ──────────────────────────────────────────────────────────────────

export interface SafetyPolicy {
  id: string;
  earthId: string;
  blockedEarthIds: string[];
  mutedEarthIds: string[];
  rateLimitUnknownSenders: boolean;
  maxMessagesPerHourUnknown: number;   // default 3
  maxEmergencySignals: number;         // default 2 per 24h
  reportAbuse: boolean;
  updatedAt: string;
}

// ─── Data Portability ────────────────────────────────────────────────────────

export interface DataPortability {
  canExportMessages: boolean;
  canDeleteLocalData: boolean;
  canDeleteServerData: boolean;
  canMigrateEarthId: boolean;
  exportFormat: 'json' | 'encrypted_archive';
}

// ─── Intention Mirror ────────────────────────────────────────────────────────

export type ReflectionMode = 'soft' | 'clear' | 'strict';

export interface IntentionMirror {
  enabled: boolean;
  checkBeforeSending: boolean;
  toneReflection: boolean;
  harmfulPatternWarning: boolean;
  userCanOverride: boolean; // always true — no censorship
  reflectionMode: ReflectionMode;
}

export type IntentionMirrorState =
  | 'not_checked' // mirror was off or not triggered
  | 'clear'       // mirror checked and found no concern
  | 'reflected'   // mirror showed a reflection — user has not yet acted
  | 'user_overrode'; // user acknowledged and chose to send anyway

export interface MirrorReflection {
  triggered: boolean;
  concerns: string[];       // plain-language observations, never judgments
  suggestedTransform?: string;
  state: IntentionMirrorState;
}

// ─── Conversation Space ───────────────────────────────────────────────────────

export type SpaceCategory =
  | 'family'
  | 'team'
  | 'gathering'
  | 'build'
  | 'artist'
  | 'documents'
  | 'care'
  | 'community'
  | 'projects'
  | 'custom';

export interface ConversationSpace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  category: SpaceCategory;
  createdAt: string;
  updatedAt: string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────
//
// UI labels follow the active locale and update live.
// Custom conversation titles preserve exactly the text authored by the user.
// Default/system titles (titleKind: 'default' or absent) may translate with the active locale.

export type ConversationType =
  | 'direct'
  | 'group'
  | 'project'
  | 'event'
  | 'place'
  | 'cause'
  | 'council'
  | 'support_circle';

export type ConversationTitleKind =
  | 'default'  // no user-authored title — renderer uses a localized type label
  | 'custom'   // explicitly authored by the user — must be rendered verbatim, never re-translated
  | 'system';  // generated by a system action (e.g. invite flow) — may translate

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  titleKind?: ConversationTitleKind;  // governs whether title follows locale or is preserved verbatim
  titleLocale?: import('../i18n/localeTypes').ActiveLocale;  // locale active when title was authored
  description?: string;
  createdByEarthId: string;
  contextEntityId?: string; // linked project/event/cause/place ID
  storageMode: StorageMode;
  spaceId?: string;          // optional space grouping
  spaceName?: string;        // denormalized display name — derived from spaceId at runtime
  isPinned?: boolean;        // pinned to top of list
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  // Creation-time hint — used to initialise ConversationSovereigntySettings, not persisted after that
  initialTrustLevel?: TrustLevel;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  earthId: string;
  role: 'owner' | 'admin' | 'member' | 'observer';
  trustSnapshot: TrustLevel; // trust level at time of joining
  joinedAt: string;
  lastReadAt?: string;
}

// ─── Message ──────────────────────────────────────────────────────────────────
//
// UI text (buttons, labels, chips) follows the active locale and updates live.
// Message body content preserves the locale and text captured at send time —
// switching the app language must never rewrite already-authored messages.

export type MessageType =
  | 'text'
  | 'voice'
  | 'video'
  | 'file'
  | 'proposal'
  | 'agreement'
  | 'task'
  | 'contribution'
  | 'ritual'
  | 'event_invite'
  | 'emergency_signal';

export type ActionState =
  | 'none'
  | 'task'
  | 'agreement'
  | 'event'
  | 'contribution';

export type MessageEncryptionStatus =
  | 'local_encrypted'   // body encrypted locally with device key; integrity hash is real SHA-256
  | 'prototype_key'     // prototype symmetric key — not production E2EE
  | 'unencrypted'       // legacy / plaintext (mock data)
  | 'integrity_failed'; // hash mismatch detected

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // EarthID
  type: MessageType;
  body?: string;
  encryptedPayload?: string; // AES-GCM encrypted body (base64 iv+ciphertext)
  encryptionStatus?: MessageEncryptionStatus;
  relayEnvelope?: import('./relay').RelayEnvelope; // local-only; never synced to server
  consentStatus: ConsentStatus;
  storageMode: StorageMode;
  trustLevel: TrustLevel;
  actionState: ActionState;
  intentionMirrorState: IntentionMirrorState;
  integrityHash: string; // SHA-256 of body + senderId + createdAt (sha256:: prefix) or placeholder
  replyToMessageId?: string;
  fileTransferId?: string;
  voiceMemoId?: string;
  isDeleted: boolean;
  createdAt: string;
  editedAt?: string;
  // Content language metadata — separates authored content from live UI translation
  createdLocale?: import('../i18n/localeTypes').ActiveLocale;  // locale active when body was authored
  contentKind?: 'user' | 'system' | 'demo' | 'generated';    // 'user' = authored; others = system-generated
  translationKey?: string;                                     // optional: i18n key if content was generated from one
  // Retention / auto-delete
  expiresAt?: string;
  deleteScope?: MessageDeleteScope;
  deleteStatus?: MessageDeleteStatus;
}

export type MessageDeleteScope =
  | 'local_only'                       // deletes from this device only
  | 'request_recipient_delete'         // sends a delete request to recipient (not enforced in v0.1)
  | 'both_devices_when_supported';     // placeholder for future enforced bilateral delete

export type MessageDeleteStatus =
  | 'active'                           // message is live
  | 'expired'                          // timer elapsed — content hidden, metadata kept
  | 'local_deleted'                    // sender/recipient deleted locally
  | 'recipient_delete_requested';      // delete request sent to recipient (v0.1: no enforcement

export type MessageRetentionTimer =
  | 'off'
  | '30s'
  | '1min'
  | '1h'
  | '24h'
  | '7d'
  | 'custom';

// ─── Canonical Message Lifecycle State ───────────────────────────────────────
//
// Represents the truthful local-first state of a message in v0.1.
// Only includes states that can actually be reached with the current implementation.
// "delivered" is intentionally absent — no real relay exists yet.

export type MessageLifecycleState =
  | 'draft'             // being composed, not yet sent
  | 'ready'             // composed, passed consent/qlpa checks, stored locally
  | 'protected_local'   // encrypted and saved on this device
  | 'waiting_approval'  // requireApproval is on — message held for consent gate
  | 'paused_blocked'    // conversation blocked or trust level blocked
  | 'relay_not_active'  // local_only storage mode — no relay configured
  | 'backup_not_enabled'// encrypted_backup mode set but backup not yet active
  | 'failed';           // local storage write failed

// ─── Message Actions ──────────────────────────────────────────────────────────

export interface MessageAction {
  id: string;
  messageId: string;
  conversationId: string;
  initiatedByEarthId: string;
  actionType: ActionState;
  status: 'open' | 'accepted' | 'declined' | 'completed' | 'expired';
  payload?: Record<string, unknown>;
  dueAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

export type LedgerEventType =
  | 'message_created'
  | 'message_blocked'
  | 'consent_validated'
  | 'consent_denied'
  | 'trust_checked'
  | 'trust_denied'
  | 'safety_checked'
  | 'safety_denied'
  | 'rate_limit_checked'
  | 'rate_limit_exceeded'
  | 'storage_validated'
  | 'mirror_reflected'
  | 'mirror_overrode'
  | 'block_applied'
  | 'report_filed'
  | 'export_requested'
  | 'delete_requested'
  | 'relay_envelope_created'
  | 'member_invited'
  | 'consent_checked'
  | 'consent_granted'
  | 'consent_pending'
  | 'conversation_created'
  | 'sovereignty_settings_initialized'
  | 'consent_matrix_initialized'
  // File transfer ledger events
  | 'file_transfer_created'
  | 'file_permission_set'
  | 'file_downloaded'
  | 'file_expired'
  | 'file_deleted_local'
  | 'file_delete_requested_remote'
  // Voice memo ledger events
  | 'voice_recording_started'
  | 'voice_recording_cancelled'
  | 'voice_message_created'
  | 'voice_message_encrypted'
  | 'voice_message_played'
  // Message retention / auto-delete ledger events
  | 'message_retention_set'
  | 'disappearing_timer_updated'
  | 'message_expired'
  | 'file_expired'
  | 'voice_expired'
  | 'message_deleted_locally'
  | 'recipient_delete_requested';

export interface LedgerEvent {
  id: string;
  earthId: string;           // actor
  relatedEarthId?: string;   // counterparty
  conversationId?: string;
  messageId?: string;
  eventType: LedgerEventType;
  passed: boolean;
  detail?: string;
  createdAt: string;
}

// ─── QLPA Validation Result ───────────────────────────────────────────────────

export interface QLPAValidationResult {
  passed: boolean;
  failedAt?: 'consent' | 'trust' | 'safety' | 'rateLimit' | 'storage' | 'intentionMirror';
  reason?: string;
  intentionMirrorState: IntentionMirrorState;
}

// ─── Sovereignty Settings (local-first, per-conversation + per-user) ──────────

export interface ConversationSovereigntySettings {
  conversationId: string;
  storageMode: StorageMode;
  trustLevel: TrustLevel;
  // Consent toggles
  allowDirectMessages: boolean;
  requireApproval: boolean;
  allowProjectInvites: boolean;
  allowEventInvites: boolean;
  allowLocationMessages: boolean;
  // Safety
  isMuted: boolean;
  isBlocked: boolean;
  updatedAt: string;
}

export interface UserSovereigntySettings {
  earthId: string;
  intentionMirror: IntentionMirror;
  updatedAt: string;
}

// ─── File Transfer ─────────────────────────────────────────────────────────────

export type FileStorageMode =
  | 'local_only'         // Free — stays on device, zero server cost
  | 'encrypted_relay'    // Plus — encrypted chunks, server deletes after delivery/expiry
  | 'encrypted_vault';   // Sovereign — long-term encrypted vault, user controls retention

export type FileRetentionPolicy =
  | 'after_download'     // server deletes once recipient downloads
  | '24h'                // auto-delete after 24 hours
  | '7d'                 // auto-delete after 7 days (default relay)
  | '30d'                // auto-delete after 30 days (vault)
  | 'manual';            // keep until user explicitly deletes

export type FileTransferStatus =
  | 'pending_local'      // created locally, not yet encrypted/uploaded
  | 'encrypting'         // encryption in progress
  | 'uploading'          // chunks uploading
  | 'ready'              // upload complete, available for download
  | 'downloading'        // recipient downloading
  | 'delivered'          // recipient has decrypted locally
  | 'expired'            // past retention policy, deleted from server
  | 'failed'             // upload or verification error
  | 'local_only';        // local_only mode — no upload ever

export type FileDeliveryEventType =
  | 'file_selected'
  | 'file_validated'
  | 'file_encrypted'
  | 'upload_started'
  | 'chunk_uploaded'
  | 'upload_complete'
  | 'download_started'
  | 'chunk_downloaded'
  | 'integrity_verified'
  | 'decrypted_locally'
  | 'expired'
  | 'deleted';

export interface FileTransfer {
  id: string;
  conversationId: string;
  senderEarthId: string;
  storageMode: FileStorageMode;
  status: FileTransferStatus;
  fileNameEncrypted?: string;
  mimeTypeEncrypted?: string;
  sizeBytes: number;
  chunkCount: number;
  encryptionStatus: 'pending' | 'encrypted' | 'failed';
  integrityHash: string;
  retentionPolicy: FileRetentionPolicy;
  // Local-only fields — never sent to server
  localObjectUrl?: string;
  localFileName?: string;
  localMimeType?: string;
  createdAt: string;
  expiresAt?: string;
  uploadedChunks?: number;
  // Local permission state
  localPermissions?: FileLocalPermissions;
  // Local deletion state
  deletedLocally?: boolean;
  deleteRequestedRemote?: boolean;
}

export interface FileLocalPermissions {
  viewOnly: boolean;
  downloadAllowed: boolean;
  forwardAllowed: boolean;
  screenshotWarning: boolean;
}

export interface FileChunk {
  id: string;
  fileTransferId: string;
  chunkIndex: number;
  objectKey: string;
  sizeBytes: number;
  chunkHash: string;
  uploadedAt?: string;
}

export interface FilePermission {
  id: string;
  fileTransferId: string;
  recipientEarthId: string;
  canDownload: boolean;
  downloadedAt?: string;
  grantedAt: string;
}

export interface FileDeliveryEvent {
  id: string;
  fileTransferId: string;
  earthId: string;
  eventType: FileDeliveryEventType;
  detail?: string;
  chunkIndex?: number;
  createdAt: string;
}

// ─── Voice Memo ───────────────────────────────────────────────────────────────

export type VoiceMemoStatus =
  | 'recording'
  | 'encrypting'
  | 'ready'
  | 'playing'
  | 'played'
  | 'failed'
  | 'expired';

export interface VoiceMemo {
  id: string;
  conversationId: string;
  senderEarthId: string;
  storageMode: FileStorageMode;
  status: VoiceMemoStatus;
  durationMs: number;
  mimeType: string;
  sizeBytes: number;
  integrityHash: string;
  retentionPolicy: FileRetentionPolicy;
  createdAt: string;
  expiresAt?: string;
  // Local-only — never sent to server
  localObjectUrl?: string;
  localBlob?: Blob;
  playedAt?: string;
  deletedLocally?: boolean;
}

export type UserTier = 'free' | 'plus' | 'sovereign';

export interface TierFileLimits {
  tier: UserTier;
  maxFileSizeBytes: number;
  allowedStorageModes: FileStorageMode[];
  monthlyTransferBytes: number;
  vaultEnabled: boolean;
  label: string;
}

export const TIER_LIMITS: Record<UserTier, TierFileLimits> = {
  free: {
    tier: 'free',
    maxFileSizeBytes: 10 * 1024 * 1024,
    allowedStorageModes: ['local_only', 'encrypted_relay'],
    monthlyTransferBytes: 10 * 1024 * 1024,
    vaultEnabled: false,
    label: 'EarthOS Walkie',
  },
  plus: {
    tier: 'plus',
    maxFileSizeBytes: 100 * 1024 * 1024,
    allowedStorageModes: ['local_only', 'encrypted_relay'],
    monthlyTransferBytes: 1 * 1024 * 1024 * 1024,
    vaultEnabled: false,
    label: 'EarthOS Relay',
  },
  sovereign: {
    tier: 'sovereign',
    maxFileSizeBytes: 2 * 1024 * 1024 * 1024,
    allowedStorageModes: ['local_only', 'encrypted_relay', 'encrypted_vault'],
    monthlyTransferBytes: 0,
    vaultEnabled: true,
    label: 'EarthOS Vault',
  },
};
