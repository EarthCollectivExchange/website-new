/**
 * EarthOS Local Encryption Foundation — Layer 6
 *
 * PROTOTYPE ENCRYPTION — NOT PRODUCTION E2EE.
 * Uses Web Crypto API with a symmetric AES-GCM key stored in localStorage.
 * This key is device-local; it never leaves the browser.
 *
 * Future layers will replace this with asymmetric key pairs, Signal Protocol
 * or libsodium, and proper key exchange before any relay sync is enabled.
 *
 * Guarantees this layer makes:
 *   - message bodies encrypted locally before being written to the store
 *   - SHA-256 integrity hash derived from body + senderId + timestamp
 *   - device key rotatable on demand; old messages become unreadable (expected)
 *   - no key material ever sent to Supabase
 */

const STORAGE_KEY = 'earthos.messaging.crypto';

// ─── Persistence helpers ──────────────────────────────────────────────────────

interface CryptoMeta {
  keyBase64: string;       // exported raw AES-GCM key, base64-encoded
  generatedAt: string;     // ISO timestamp
  algorithm: string;       // informational — 'AES-GCM-256'
  version: number;
  label: 'prototype-local-key';
}

function loadMeta(): CryptoMeta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CryptoMeta;
  } catch {
    return null;
  }
}

function saveMeta(meta: CryptoMeta): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
}

// ─── Key pair (symmetric for prototype) ──────────────────────────────────────

export interface DeviceKeyResult {
  publicKeyPlaceholder: string; // base64 of key — stands in for a real public key
  generatedAt: string;
  algorithm: string;
  label: 'prototype-local-key';
}

export async function generateDeviceKeyPair(): Promise<DeviceKeyResult> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const rawKey = await crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawKey))));

  const meta: CryptoMeta = {
    keyBase64,
    generatedAt: new Date().toISOString(),
    algorithm: 'AES-GCM-256',
    version: 1,
    label: 'prototype-local-key',
  };

  saveMeta(meta);

  return {
    publicKeyPlaceholder: keyBase64.slice(0, 24) + '…',
    generatedAt: meta.generatedAt,
    algorithm: meta.algorithm,
    label: meta.label,
  };
}

export async function exportPublicKey(): Promise<string | null> {
  const meta = loadMeta();
  if (!meta) return null;
  // In a prototype, the "public key" is just a truncated fingerprint of the symmetric key.
  // A real implementation would export the public half of an asymmetric key pair.
  return meta.keyBase64.slice(0, 24) + '… [prototype-symmetric-key]';
}

// ─── Key loading ──────────────────────────────────────────────────────────────

async function loadOrGenerateKey(): Promise<CryptoKey> {
  let meta = loadMeta();
  if (!meta) {
    await generateDeviceKeyPair();
    meta = loadMeta()!;
  }

  const rawBytes = Uint8Array.from(atob(meta.keyBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

export interface EncryptResult {
  encryptedPayload: string; // base64(iv + ciphertext)
  ivBase64: string;
}

export async function encryptMessageLocal(body: string): Promise<EncryptResult> {
  const key = await loadOrGenerateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(body);

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  // Prepend IV to ciphertext so decryption is self-contained
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  const encryptedPayload = btoa(String.fromCharCode.apply(null, Array.from(combined)));
  const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)));

  return { encryptedPayload, ivBase64 };
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

export async function decryptMessageLocal(encryptedPayload: string): Promise<string | null> {
  try {
    const key = await loadOrGenerateKey();
    const combined = Uint8Array.from(atob(encryptedPayload), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

// ─── Integrity hash ───────────────────────────────────────────────────────────

export async function createIntegrityHash(
  body: string,
  senderId: string,
  createdAt: string
): Promise<string> {
  const input = `${senderId}:${createdAt}:${body}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256::${hashHex}`;
}

export async function verifyIntegrityHash(
  body: string,
  senderId: string,
  createdAt: string,
  expectedHash: string
): Promise<boolean> {
  if (!expectedHash.startsWith('sha256::')) return false;
  const computed = await createIntegrityHash(body, senderId, createdAt);
  return computed === expectedHash;
}

// ─── Public metadata ──────────────────────────────────────────────────────────

export interface CryptoDeviceMeta {
  exists: boolean;
  generatedAt: string | null;
  algorithm: string | null;
  label: string | null;
  publicKeyFingerprint: string | null;
}

export function getDeviceCryptoMeta(): CryptoDeviceMeta {
  const meta = loadMeta();
  if (!meta) {
    return { exists: false, generatedAt: null, algorithm: null, label: null, publicKeyFingerprint: null };
  }
  return {
    exists: true,
    generatedAt: meta.generatedAt,
    algorithm: meta.algorithm,
    label: meta.label,
    publicKeyFingerprint: meta.keyBase64.slice(0, 16) + '…',
  };
}

// ─── Bulk integrity check ─────────────────────────────────────────────────────

export interface MessageIntegrityInput {
  id: string;
  body?: string;
  senderId: string;
  createdAt: string;
  integrityHash: string;
}

export interface IntegrityCheckResult {
  allPassed: boolean;
  checkedCount: number;
  skippedCount: number; // messages with placeholder hashes (legacy / mock data)
  failedIds: string[];
}

export async function verifyLocalMessageIntegrity(
  messages: MessageIntegrityInput[]
): Promise<IntegrityCheckResult> {
  let checkedCount = 0;
  let skippedCount = 0;
  const failedIds: string[] = [];

  for (const msg of messages) {
    // Only verify real SHA-256 hashes — skip placeholder hashes from mock/legacy data
    if (!msg.integrityHash.startsWith('sha256::')) {
      skippedCount++;
      continue;
    }
    checkedCount++;
    const ok = await verifyIntegrityHash(
      msg.body ?? '',
      msg.senderId,
      msg.createdAt,
      msg.integrityHash
    );
    if (!ok) failedIds.push(msg.id);
  }

  return {
    allPassed: failedIds.length === 0,
    checkedCount,
    skippedCount,
    failedIds,
  };
}

// ─── Encrypt/decrypt roundtrip test ──────────────────────────────────────────

export interface RoundtripTestResult {
  passed: boolean;
  error: string | null;
  plaintextIn: string;
  plaintextOut: string | null;
  hashMatch: boolean;
}

export async function testEncryptDecryptRoundtrip(): Promise<RoundtripTestResult> {
  const TEST_BODY = 'EarthOS crypto roundtrip test — \u2713';
  const TEST_SENDER = 'test-sender';
  const TEST_TS = new Date().toISOString();

  try {
    const { encryptedPayload } = await encryptMessageLocal(TEST_BODY);
    const decrypted = await decryptMessageLocal(encryptedPayload);
    const hashIn = await createIntegrityHash(TEST_BODY, TEST_SENDER, TEST_TS);
    const hashMatch = await verifyIntegrityHash(TEST_BODY, TEST_SENDER, TEST_TS, hashIn);

    return {
      passed: decrypted === TEST_BODY && hashMatch,
      error: null,
      plaintextIn: TEST_BODY,
      plaintextOut: decrypted,
      hashMatch,
    };
  } catch (err) {
    return {
      passed: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      plaintextIn: TEST_BODY,
      plaintextOut: null,
      hashMatch: false,
    };
  }
}
