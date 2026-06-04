// ─── QLPA Communication Capability Matrix ─────────────────────────────────────
//
// Canonical policy for every communication capability kind.
// No capability may be added to the UI without a corresponding entry here.
// All functions are pure; no imports from React or browser APIs.
//
// Integrations (read-only, no circular imports):
//   releaseContract  — maps kind to release capability key
//   communicationEnvelope — CommunicationKind source of truth
//   shieldPolicy     — ShieldLevel + EnvelopeShieldCategory
//   trustGraph       — TrustLevel, trustMeetsMinimum

import type { TrustLevel } from '@/lib/messaging/types';
import { trustMeetsMinimum } from './trustGraph';
import { getShieldCategoryForEnvelopeKind } from './shieldPolicy';
import { isCapabilityActive } from './releaseContract';
import type { EnvelopeShieldCategory } from './shieldPolicy';

// ─── Capability kind ──────────────────────────────────────────────────────────

export type CapabilityKind =
  | 'text-message'
  | 'voice-note'
  | 'audio-call'
  | 'video-call'
  | 'photo-message'
  | 'video-message'
  | 'file-transfer'
  | 'location-message'
  | 'contact-card'
  | 'event-invite'
  | 'governance-signal'
  | 'earthos-public-signal'
  | 'earthcoin-signal'
  | 'emergency-report'
  | 'system-notice';

// ─── Metadata exposure level ──────────────────────────────────────────────────

export type MetadataExposure = 'none' | 'local-only' | 'relay-header' | 'public';

// ─── Retention class ─────────────────────────────────────────────────────────

export type RetentionClass =
  | 'ephemeral'     // auto-clear after session
  | 'standard'      // user-controlled retention
  | 'durable'       // explicit keep; user must actively clear
  | 'ledger-only';  // content clears; ledger event persists

// ─── Export class ─────────────────────────────────────────────────────────────

export type ExportClass =
  | 'local-only'        // never leaves device without explicit user action
  | 'relay-optional'    // can traverse relay with consent
  | 'bridge-gated'      // requires EarthOS Bridge consent to cross boundary
  | 'not-exportable';   // must never be exported in any form

// ─── Capability policy ───────────────────────────────────────────────────────

export interface CapabilityPolicy {
  kind: CapabilityKind;
  labelKey: string;

  // Release contract key (maps to QLPA_CAPABILITIES in releaseContract.ts)
  releaseCapability: string;

  // Storage
  defaultStorage: 'local-only' | 'encrypted-relay' | 'public-ledger';

  // Consent and trust
  requiresConsent: boolean;
  minimumTrustLevel: TrustLevel;

  // Forwarding / signal escalation
  canBeForwarded: boolean;
  canBecomePublicSignal: boolean;    // requires explicit Bridge consent
  canBecomeEarthCoinRecord: boolean; // requires explicit EarthCoin consent
  canBecomeGovernanceRecord: boolean; // requires explicit Governance consent

  // Media and recording
  requiresMediaPermission: boolean;  // camera / microphone OS permission
  requiresRecordingConsent: boolean; // explicit in-app consent from all parties

  // Shield
  requiresShieldCheck: boolean;

  // Context availability
  allowedInDirect: boolean;
  allowedInGroup: boolean;
  allowedInCommunity: boolean;

  // Privacy classification
  metadataExposure: MetadataExposure;
  retentionClass: RetentionClass;
  exportClass: ExportClass;
}

// ─── Capability matrix ───────────────────────────────────────────────────────
// Rules applied:
//   1. Private text does not become public by default.
//   2. Voice, photo, video, files, location, calls require stronger consent.
//   3. Calls and recordings require explicit recording/call consent.
//   4. Unknown trust level does not allow media, files, calls, or location.
//   5. Child-safety / sexual-violence categories always escalate through Shield.
//   6. EarthCoin and governance records must never come from raw private content.
//   7. Public signals require explicit Bridge consent.

export const CAPABILITY_MATRIX: Readonly<Record<CapabilityKind, CapabilityPolicy>> = {

  'text-message': {
    kind: 'text-message',
    labelKey: 'capability.textMessage',
    releaseCapability: 'textMessaging',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'unknown',       // basic contact can receive text invite
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: true,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: true,
    metadataExposure: 'local-only',
    retentionClass: 'standard',
    exportClass: 'local-only',
  },

  'voice-note': {
    kind: 'voice-note',
    labelKey: 'capability.voiceNote',
    releaseCapability: 'voiceNotes',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'known',         // stronger than text: at least known
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: true,      // microphone
    requiresRecordingConsent: true,
    requiresShieldCheck: true,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: false,
    metadataExposure: 'local-only',
    retentionClass: 'standard',
    exportClass: 'local-only',
  },

  'audio-call': {
    kind: 'audio-call',
    labelKey: 'capability.audioCall',
    releaseCapability: 'audioCalls',
    defaultStorage: 'local-only',       // no recording by default
    requiresConsent: true,
    minimumTrustLevel: 'trusted',       // calls require trusted relationship
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: true,      // microphone
    requiresRecordingConsent: true,
    requiresShieldCheck: true,
    allowedInDirect: true,
    allowedInGroup: false,
    allowedInCommunity: false,
    metadataExposure: 'relay-header',   // call metadata (duration, parties)
    retentionClass: 'ephemeral',
    exportClass: 'not-exportable',
  },

  'video-call': {
    kind: 'video-call',
    labelKey: 'capability.videoCall',
    releaseCapability: 'videoCalls',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'trusted',       // calls require trusted relationship
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: true,      // camera + microphone
    requiresRecordingConsent: true,
    requiresShieldCheck: true,
    allowedInDirect: true,
    allowedInGroup: false,
    allowedInCommunity: false,
    metadataExposure: 'relay-header',
    retentionClass: 'ephemeral',
    exportClass: 'not-exportable',
  },

  'photo-message': {
    kind: 'photo-message',
    labelKey: 'capability.photoMessage',
    releaseCapability: 'photoMessages',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'known',         // media requires at least known
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: true,      // camera / photo library
    requiresRecordingConsent: false,
    requiresShieldCheck: true,          // CSAM / illegal content check
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: false,
    metadataExposure: 'local-only',
    retentionClass: 'standard',
    exportClass: 'local-only',
  },

  'video-message': {
    kind: 'video-message',
    labelKey: 'capability.videoMessage',
    releaseCapability: 'videoMessages',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'known',
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: true,      // camera
    requiresRecordingConsent: true,
    requiresShieldCheck: true,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: false,
    metadataExposure: 'local-only',
    retentionClass: 'standard',
    exportClass: 'local-only',
  },

  'file-transfer': {
    kind: 'file-transfer',
    labelKey: 'capability.fileTransfer',
    releaseCapability: 'fileTransfer',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'known',         // files require at least known
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: true,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: false,
    metadataExposure: 'local-only',
    retentionClass: 'durable',
    exportClass: 'relay-optional',
  },

  'location-message': {
    kind: 'location-message',
    labelKey: 'capability.locationMessage',
    releaseCapability: 'locationSharing',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'trusted',       // location requires trusted
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: true,      // OS location permission
    requiresRecordingConsent: false,
    requiresShieldCheck: false,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: false,
    metadataExposure: 'local-only',
    retentionClass: 'ephemeral',        // location data clears quickly
    exportClass: 'not-exportable',
  },

  'contact-card': {
    kind: 'contact-card',
    labelKey: 'capability.contactCard',
    releaseCapability: 'contactCards',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'known',
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: false,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: false,
    metadataExposure: 'local-only',
    retentionClass: 'durable',
    exportClass: 'local-only',
  },

  'event-invite': {
    kind: 'event-invite',
    labelKey: 'capability.eventInvite',
    releaseCapability: 'eventInvites',
    defaultStorage: 'local-only',
    requiresConsent: true,
    minimumTrustLevel: 'unknown',
    canBeForwarded: true,               // invites may be shared
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: false,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: true,
    metadataExposure: 'relay-header',
    retentionClass: 'standard',
    exportClass: 'relay-optional',
  },

  'governance-signal': {
    kind: 'governance-signal',
    labelKey: 'capability.governanceSignal',
    releaseCapability: 'governanceSignals',
    defaultStorage: 'public-ledger',
    requiresConsent: true,
    minimumTrustLevel: 'trusted',
    canBeForwarded: false,
    canBecomePublicSignal: true,        // governance signals are inherently public
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: true,    // this IS the governance record
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: true,
    allowedInDirect: false,
    allowedInGroup: false,
    allowedInCommunity: true,           // councils only
    metadataExposure: 'public',
    retentionClass: 'ledger-only',
    exportClass: 'bridge-gated',
  },

  'earthos-public-signal': {
    kind: 'earthos-public-signal',
    labelKey: 'capability.earthosPublicSignal',
    releaseCapability: 'publicSignals',
    defaultStorage: 'public-ledger',
    requiresConsent: true,
    minimumTrustLevel: 'trusted',
    canBeForwarded: true,
    canBecomePublicSignal: true,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: true,
    allowedInDirect: false,
    allowedInGroup: false,
    allowedInCommunity: true,
    metadataExposure: 'public',
    retentionClass: 'ledger-only',
    exportClass: 'bridge-gated',        // requires explicit Bridge consent
  },

  'earthcoin-signal': {
    kind: 'earthcoin-signal',
    labelKey: 'capability.earthcoinSignal',
    releaseCapability: 'earthCoin',
    defaultStorage: 'public-ledger',
    requiresConsent: true,
    minimumTrustLevel: 'trusted',
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: true,     // this IS the EarthCoin record
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: true,
    allowedInDirect: false,
    allowedInGroup: false,
    allowedInCommunity: true,
    metadataExposure: 'public',
    retentionClass: 'ledger-only',
    exportClass: 'bridge-gated',
  },

  'emergency-report': {
    kind: 'emergency-report',
    labelKey: 'capability.emergencyReport',
    releaseCapability: 'emergencyReports',
    defaultStorage: 'encrypted-relay',  // must reach safety services
    requiresConsent: true,
    minimumTrustLevel: 'unknown',       // emergency can be sent from any context
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: false,         // safety reports bypass shield escalation
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: true,
    metadataExposure: 'relay-header',
    retentionClass: 'durable',
    exportClass: 'relay-optional',
  },

  'system-notice': {
    kind: 'system-notice',
    labelKey: 'capability.systemNotice',
    releaseCapability: 'systemNotices',
    defaultStorage: 'local-only',
    requiresConsent: false,             // system-generated, no sender consent needed
    minimumTrustLevel: 'unknown',
    canBeForwarded: false,
    canBecomePublicSignal: false,
    canBecomeEarthCoinRecord: false,
    canBecomeGovernanceRecord: false,
    requiresMediaPermission: false,
    requiresRecordingConsent: false,
    requiresShieldCheck: false,
    allowedInDirect: true,
    allowedInGroup: true,
    allowedInCommunity: true,
    metadataExposure: 'local-only',
    retentionClass: 'standard',
    exportClass: 'local-only',
  },
} as const;

// ─── Helper functions (all pure) ──────────────────────────────────────────────

export function getCapabilityPolicy(kind: CapabilityKind): CapabilityPolicy {
  return CAPABILITY_MATRIX[kind];
}

export function canCapabilityRunInTrust(kind: CapabilityKind, trustLevel: TrustLevel): boolean {
  const policy = CAPABILITY_MATRIX[kind];
  return trustMeetsMinimum(trustLevel, policy.minimumTrustLevel);
}

export function requiresExplicitConsent(kind: CapabilityKind): boolean {
  return CAPABILITY_MATRIX[kind].requiresConsent;
}

export function requiresRecordingNotice(kind: CapabilityKind): boolean {
  return CAPABILITY_MATRIX[kind].requiresRecordingConsent;
}

export function canCapabilityCrossEarthOSBridge(kind: CapabilityKind): boolean {
  const policy = CAPABILITY_MATRIX[kind];
  // Only bridge-gated or relay-optional capabilities can cross the EarthOS Bridge,
  // and only when the capability explicitly opts into public signal or bridge-gated export.
  return policy.exportClass === 'bridge-gated' || policy.canBecomePublicSignal;
}

export function canCapabilityCrossEarthCoinBoundary(kind: CapabilityKind): boolean {
  return CAPABILITY_MATRIX[kind].canBecomeEarthCoinRecord;
}

export function canCapabilityEnterGovernance(kind: CapabilityKind): boolean {
  return CAPABILITY_MATRIX[kind].canBecomeGovernanceRecord;
}

export function getCapabilityShieldCategory(kind: CapabilityKind): EnvelopeShieldCategory {
  // Map CapabilityKind to the CommunicationKindForShield values shieldPolicy accepts.
  // voice-note, audio-call, video-call → 'voice' or 'call' (live); others map directly.
  switch (kind) {
    case 'text-message':
    case 'contact-card':
    case 'event-invite':
    case 'governance-signal':
    case 'earthos-public-signal':
    case 'earthcoin-signal':
    case 'emergency-report':
      return getShieldCategoryForEnvelopeKind('text');
    case 'voice-note':
      return getShieldCategoryForEnvelopeKind('voice');
    case 'audio-call':
    case 'video-call':
      return getShieldCategoryForEnvelopeKind('call');
    case 'photo-message':
      return getShieldCategoryForEnvelopeKind('photo');
    case 'video-message':
      return getShieldCategoryForEnvelopeKind('video');
    case 'file-transfer':
      return getShieldCategoryForEnvelopeKind('file');
    case 'location-message':
      return getShieldCategoryForEnvelopeKind('location');
    case 'system-notice':
      return getShieldCategoryForEnvelopeKind('system');
  }
}

export function getCapabilityReleaseStatus(kind: CapabilityKind): 'active' | 'inactive' | 'unknown' {
  const policy = CAPABILITY_MATRIX[kind];
  if (!policy.releaseCapability) return 'unknown';
  return isCapabilityActive(policy.releaseCapability) ? 'active' : 'inactive';
}

// ─── Typed list of all capability kinds ──────────────────────────────────────

export const ALL_CAPABILITY_KINDS: readonly CapabilityKind[] = [
  'text-message',
  'voice-note',
  'audio-call',
  'video-call',
  'photo-message',
  'video-message',
  'file-transfer',
  'location-message',
  'contact-card',
  'event-invite',
  'governance-signal',
  'earthos-public-signal',
  'earthcoin-signal',
  'emergency-report',
  'system-notice',
] as const;
