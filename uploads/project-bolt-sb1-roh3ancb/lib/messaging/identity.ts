/**
 * EarthOS Identity Core — Layer 10
 *
 * Provides a unified identity registry that merges:
 *   - Static mock EarthID objects (MOCK_EARTH_IDS)
 *   - Locally-created identities (invited/simulated members)
 *   - The authenticated viewer's own identity
 *
 * Keeps `senderId` as a string reference — this module resolves
 * those strings to full EarthID objects at render time.
 *
 * Keypair fields are placeholders only — no cryptographic operations here.
 */

import type { EarthID, TrustLevel, StorageMode } from './types';
import { MOCK_EARTH_IDS } from './mockData';

// ─── Registry ─────────────────────────────────────────────────────────────────

export type IdentityRegistry = Map<string, EarthID>;

let _registry: IdentityRegistry = new Map(
  MOCK_EARTH_IDS.map((e) => [e.id, withDefaults(e)])
);

function withDefaults(e: EarthID): EarthID {
  return {
    ...e,
    isLocal: e.isLocal ?? false,
  };
}

/** Resolve a string EarthID to its full identity object. */
export function resolveIdentity(id: string): EarthID | undefined {
  return _registry.get(id);
}

/** Register a locally-created identity (e.g. an invited/simulated member). */
export function registerLocalIdentity(identity: EarthID): void {
  _registry.set(identity.id, identity);
}

/** Remove a locally-registered identity. Does not affect mock data. */
export function unregisterLocalIdentity(id: string): void {
  if (_registry.get(id)?.isLocal) {
    _registry.delete(id);
  }
}

/** Return all registered identities. */
export function getAllIdentities(): EarthID[] {
  return Array.from(_registry.values());
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Build a local EarthID from an invite form.
 * Generates a deterministic-looking ID from the handle.
 * The keypairPlaceholder field documents that a real keypair will live here
 * once encryption is wired end-to-end.
 */
export function buildLocalIdentity(params: {
  id: string;
  handle: string;
  displayName: string;
  trustLevel: TrustLevel;
  storagePreference?: StorageMode;
}): EarthID {
  const now = new Date().toISOString();
  return {
    id: params.id,
    authUserId: '',                         // no auth session for simulated identities
    handle: params.handle.startsWith('@') ? params.handle : `@${params.handle}`,
    displayName: params.displayName,
    avatarUrl: undefined,
    bio: undefined,
    sovereignSince: now,
    isActive: true,
    storagePreference: params.storagePreference ?? 'local_only',
    intentionMirrorConfig: {
      enabled: false,
      checkBeforeSending: false,
      toneReflection: false,
      harmfulPatternWarning: false,
      userCanOverride: true,
      reflectionMode: 'soft',
    },
    createdAt: now,
    updatedAt: now,
    // Layer 10 fields
    trustLevel: params.trustLevel,
    isLocal: true,
    keypairPlaceholder: `keypair::${params.id}::placeholder`,
  };
}

// ─── Viewer identity ──────────────────────────────────────────────────────────

/**
 * Returns the viewer's own EarthID, or a minimal stub if they are not in the
 * registry (e.g. authenticated user whose EarthID is not yet synced locally).
 */
export function resolveViewerIdentity(viewerEarthId: string): EarthID {
  const found = resolveIdentity(viewerEarthId);
  if (found) return found;

  // Stub for unrecognised viewer (authenticated but not in mock/local registry)
  const now = new Date().toISOString();
  return {
    id: viewerEarthId,
    authUserId: viewerEarthId,
    handle: '@you',
    displayName: 'You',
    sovereignSince: now,
    isActive: true,
    storagePreference: 'local_only',
    intentionMirrorConfig: { enabled: false, checkBeforeSending: false, toneReflection: false, harmfulPatternWarning: false, userCanOverride: true, reflectionMode: 'soft' },
    createdAt: now,
    updatedAt: now,
    isLocal: false,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve display name, falling back gracefully. */
export function resolveDisplayName(id: string): string {
  return resolveIdentity(id)?.displayName ?? id.slice(0, 12) + '…';
}

/** Resolve handle, falling back to the ID. */
export function resolveHandle(id: string): string {
  return resolveIdentity(id)?.handle ?? id;
}

/** Check if an EarthID string belongs to a locally-created identity. */
export function isLocalIdentity(id: string): boolean {
  return resolveIdentity(id)?.isLocal === true;
}
