import type { StorageMode } from './types';

export interface StorageValidationInput {
  requestedMode: StorageMode;
  userPreference: StorageMode;
  conversationMode: StorageMode;
}

export interface StorageValidationResult {
  passed: boolean;
  resolvedMode: StorageMode;
  reason?: string;
}

// Storage mode precedence: user preference takes priority, then conversation default.
// A message can never be stored in a less private mode than the user has chosen.
const PRIVACY_RANK: Record<StorageMode, number> = {
  local_only: 3,        // most private
  encrypted_relay: 2,
  encrypted_backup: 1,  // least restrictive — user explicitly opted in
};

export function validateStorageMode(input: StorageValidationInput): StorageValidationResult {
  const { requestedMode, userPreference, conversationMode } = input;

  // Resolve to the most private of the three
  const modes: StorageMode[] = [requestedMode, userPreference, conversationMode];
  const resolved = modes.reduce((prev, curr) =>
    PRIVACY_RANK[curr] > PRIVACY_RANK[prev] ? curr : prev
  );

  return {
    passed: true,
    resolvedMode: resolved,
  };
}

// Placeholder encryption — not final implementation
export function placeholderEncrypt(payload: string): string {
  // TODO: replace with E2E encryption (Signal Protocol / libsodium)
  return `enc::${btoa(payload)}`;
}

export function placeholderDecrypt(encrypted: string): string {
  // TODO: replace with E2E decryption
  if (encrypted.startsWith('enc::')) {
    return atob(encrypted.slice(5));
  }
  return encrypted;
}

export function placeholderIntegrityHash(
  body: string,
  senderId: string,
  timestamp: string
): string {
  // TODO: replace with real SHA-256
  const raw = `${senderId}:${timestamp}:${body}`;
  // btoa only handles Latin1; encode to percent-escaped ASCII first
  const safe = encodeURIComponent(raw).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  return `hash::${btoa(safe).slice(0, 32)}`;
}
