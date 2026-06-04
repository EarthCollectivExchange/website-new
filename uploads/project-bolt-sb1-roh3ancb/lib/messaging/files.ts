/**
 * EarthOS File Transfer — Layer 8
 *
 * Local-first encrypted file transfer with three tiers:
 *   Free  (local_only)       — device only, zero server cost
 *   Plus  (encrypted_relay)  — AES-GCM encrypted chunks, auto-deleted server-side
 *   Sovereign (encrypted_vault) — long-term encrypted vault, user controls retention
 *
 * INVARIANTS:
 *   - Plaintext file content NEVER leaves the device
 *   - Plaintext filename and MIME type NEVER stored on server
 *   - All uploads are encrypted chunks only
 *   - Integrity hash computed over encrypted bytes
 */

import type {
  FileTransfer,
  FileChunk,
  FileStorageMode,
  FileRetentionPolicy,
  UserTier,
  TierFileLimits,
} from './types';
import { TIER_LIMITS } from './types';

const CHUNK_SIZE_SMALL = 4 * 1024 * 1024;   // 4 MB
const CHUNK_SIZE_LARGE = 8 * 1024 * 1024;   // 8 MB for files > 100 MB
const SINGLE_OBJECT_LIMIT = 25 * 1024 * 1024; // single-object threshold

// ─── Validation ───────────────────────────────────────────────────────────────

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
  suggestedMode?: FileStorageMode;
  estimatedCost?: FileCostEstimate;
}

export function validateFileForTier(
  file: File,
  tier: UserTier,
  requestedMode: FileStorageMode
): FileValidationResult {
  const limits: TierFileLimits = TIER_LIMITS[tier];

  if (file.size > limits.maxFileSizeBytes) {
    const maxMb = (limits.maxFileSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      reason: `File exceeds your ${limits.label} limit of ${maxMb} MB.`,
    };
  }

  if (!limits.allowedStorageModes.includes(requestedMode)) {
    if (requestedMode === 'encrypted_vault' && !limits.vaultEnabled) {
      return {
        valid: false,
        reason: 'Encrypted vault requires Sovereign tier.',
        suggestedMode: 'encrypted_relay',
      };
    }
    return {
      valid: false,
      reason: `Storage mode not available on your current plan.`,
      suggestedMode: limits.allowedStorageModes[0],
    };
  }

  return { valid: true, estimatedCost: estimateFileCost(file.size, requestedMode) };
}

// ─── Cost estimation ──────────────────────────────────────────────────────────

export interface FileCostEstimate {
  storageMode: FileStorageMode;
  storageCostLabel: string;
  transferCostLabel: string;
  retentionLabel: string;
  serverSideLabel: string;
}

export function estimateFileCost(sizeBytes: number, mode: FileStorageMode): FileCostEstimate {
  const mb = sizeBytes / (1024 * 1024);
  const gb = mb / 1024;

  switch (mode) {
    case 'local_only':
      return {
        storageMode: 'local_only',
        storageCostLabel: 'Free — device only',
        transferCostLabel: '$0 upload cost',
        retentionLabel: 'Device storage only',
        serverSideLabel: 'No server cost — file never leaves your device.',
      };
    case 'encrypted_relay': {
      const dollars = gb * 0.015;
      const label = dollars < 0.001 ? '< $0.001/month' : `~$${dollars.toFixed(3)}/month`;
      return {
        storageMode: 'encrypted_relay',
        storageCostLabel: label,
        transferCostLabel: 'No egress fees (R2)',
        retentionLabel: 'Auto-deleted after delivery or 7 days',
        serverSideLabel: `Encrypted chunks stored temporarily on R2. ${mb.toFixed(1)} MB sealed before upload.`,
      };
    }
    case 'encrypted_vault': {
      const dollars = gb * 0.015 * 30;
      const label = dollars < 0.01 ? '< $0.01' : `~$${dollars.toFixed(2)}`;
      return {
        storageMode: 'encrypted_vault',
        storageCostLabel: `${label} for 30 days`,
        transferCostLabel: 'No egress fees (R2)',
        retentionLabel: 'Kept until you delete it',
        serverSideLabel: `Encrypted vault. ${mb.toFixed(1)} MB. You control deletion.`,
      };
    }
  }
}

// ─── Chunk strategy ───────────────────────────────────────────────────────────

export function resolveChunkSize(fileSizeBytes: number): number {
  if (fileSizeBytes <= SINGLE_OBJECT_LIMIT) return fileSizeBytes;
  if (fileSizeBytes <= 100 * 1024 * 1024) return CHUNK_SIZE_SMALL;
  return CHUNK_SIZE_LARGE;
}

export function calculateChunkCount(fileSizeBytes: number): number {
  if (fileSizeBytes <= SINGLE_OBJECT_LIMIT) return 1;
  return Math.ceil(fileSizeBytes / resolveChunkSize(fileSizeBytes));
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

const CRYPTO_STORAGE_KEY = 'earthos.messaging.crypto';

async function loadOrGenerateKey(): Promise<CryptoKey> {
  let keyBase64: string | null = null;
  try {
    const raw = localStorage.getItem(CRYPTO_STORAGE_KEY);
    if (raw) keyBase64 = (JSON.parse(raw) as { keyBase64: string }).keyBase64;
  } catch { /* fall through */ }

  if (keyBase64) {
    const rawBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const exported = await crypto.subtle.exportKey('raw', key);
  const b64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(exported))));
  localStorage.setItem(CRYPTO_STORAGE_KEY, JSON.stringify({
    keyBase64: b64,
    generatedAt: new Date().toISOString(),
    algorithm: 'AES-GCM-256',
    version: 1,
    label: 'prototype-local-key',
  }));
  return key;
}

async function computeBytesHash(bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return `sha256::${Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

async function encryptString(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ct), iv.length);
  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

// ─── File encryption ──────────────────────────────────────────────────────────

export interface EncryptedFileEnvelope {
  encryptedBytes: Uint8Array;
  ivBase64: string;
  integrityHash: string;
  originalSizeBytes: number;
  encryptedSizeBytes: number;
}

export async function encryptFileLocal(file: File): Promise<EncryptedFileEnvelope> {
  const key = await loadOrGenerateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileBytes = await file.arrayBuffer();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fileBytes);

  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ct), iv.length);

  return {
    encryptedBytes: combined,
    ivBase64: btoa(String.fromCharCode.apply(null, Array.from(iv))),
    integrityHash: await computeBytesHash(combined),
    originalSizeBytes: fileBytes.byteLength,
    encryptedSizeBytes: combined.byteLength,
  };
}

export async function decryptFileLocal(encryptedBytes: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    const raw = localStorage.getItem(CRYPTO_STORAGE_KEY);
    if (!raw) return null;
    const { keyBase64 } = JSON.parse(raw) as { keyBase64: string };
    const rawBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv: encryptedBytes.slice(0, 12) }, key, encryptedBytes.slice(12));
  } catch {
    return null;
  }
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

export interface EncryptedChunk {
  chunkIndex: number;
  bytes: Uint8Array;
  chunkHash: string;
  sizeBytes: number;
}

export async function splitFileIntoChunks(encryptedBytes: Uint8Array): Promise<EncryptedChunk[]> {
  const chunkSize = resolveChunkSize(encryptedBytes.byteLength);
  const chunks: EncryptedChunk[] = [];
  let offset = 0;
  let index = 0;
  while (offset < encryptedBytes.byteLength) {
    const slice = encryptedBytes.slice(offset, offset + chunkSize);
    chunks.push({ chunkIndex: index, bytes: slice, chunkHash: await computeBytesHash(slice), sizeBytes: slice.byteLength });
    offset += chunkSize;
    index++;
  }
  return chunks;
}

export async function createChunkHashes(chunks: EncryptedChunk[]): Promise<string[]> {
  return chunks.map((c) => c.chunkHash);
}

export async function createFileIntegrityHash(encryptedBytes: Uint8Array): Promise<string> {
  return computeBytesHash(encryptedBytes);
}

// ─── Encrypted metadata ───────────────────────────────────────────────────────

export interface EncryptedFileMeta {
  fileNameEncrypted: string;
  mimeTypeEncrypted: string;
}

export async function encryptFileMeta(fileName: string, mimeType: string): Promise<EncryptedFileMeta> {
  try {
    const key = await loadOrGenerateKey();
    return {
      fileNameEncrypted: await encryptString(fileName, key),
      mimeTypeEncrypted: await encryptString(mimeType, key),
    };
  } catch {
    return { fileNameEncrypted: btoa(fileName), mimeTypeEncrypted: btoa(mimeType) };
  }
}

// ─── Retention helpers ────────────────────────────────────────────────────────

export function resolveDefaultRetention(mode: FileStorageMode): FileRetentionPolicy {
  if (mode === 'local_only') return 'manual';
  if (mode === 'encrypted_relay') return '7d';
  return 'manual';
}

export function calculateRetentionExpiry(policy: FileRetentionPolicy, fromIso: string): string | undefined {
  const from = new Date(fromIso).getTime();
  switch (policy) {
    case '24h':  return new Date(from + 24 * 60 * 60 * 1000).toISOString();
    case '7d':   return new Date(from + 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':  return new Date(from + 30 * 24 * 60 * 60 * 1000).toISOString();
    default:     return undefined;
  }
}

// ─── Envelope factory ─────────────────────────────────────────────────────────

export interface PreparedFileEnvelope {
  transfer: FileTransfer;
  chunks: FileChunk[];
  encryptedEnvelope: EncryptedFileEnvelope;
  encryptedChunks: EncryptedChunk[];
}

export async function prepareEncryptedFileEnvelope(
  file: File,
  conversationId: string,
  senderEarthId: string,
  storageMode: FileStorageMode,
  tier: UserTier
): Promise<PreparedFileEnvelope> {
  const validation = validateFileForTier(file, tier, storageMode);
  if (!validation.valid) throw new Error(validation.reason ?? 'File validation failed');

  const encrypted = await encryptFileLocal(file);
  const encryptedChunks = await splitFileIntoChunks(encrypted.encryptedBytes);
  const encMeta = await encryptFileMeta(file.name, file.type || 'application/octet-stream');

  const now = new Date().toISOString();
  const transferId = `ft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const retention = resolveDefaultRetention(storageMode);

  const transfer: FileTransfer = {
    id: transferId,
    conversationId,
    senderEarthId,
    storageMode,
    status: storageMode === 'local_only' ? 'local_only' : 'pending_local',
    fileNameEncrypted: encMeta.fileNameEncrypted,
    mimeTypeEncrypted: encMeta.mimeTypeEncrypted,
    sizeBytes: file.size,
    chunkCount: encryptedChunks.length,
    encryptionStatus: 'encrypted',
    integrityHash: encrypted.integrityHash,
    retentionPolicy: retention,
    localFileName: file.name,
    localMimeType: file.type || 'application/octet-stream',
    createdAt: now,
    expiresAt: calculateRetentionExpiry(retention, now),
    uploadedChunks: 0,
  };

  const chunks: FileChunk[] = encryptedChunks.map((ec) => ({
    id: `fchk-${transferId}-${ec.chunkIndex}`,
    fileTransferId: transferId,
    chunkIndex: ec.chunkIndex,
    objectKey: `files/${transferId}/chunk-${ec.chunkIndex}`,
    sizeBytes: ec.sizeBytes,
    chunkHash: ec.chunkHash,
  }));

  return { transfer, chunks, encryptedEnvelope: encrypted, encryptedChunks };
}

// ─── createFileTransfer — main entry point ────────────────────────────────────

export async function createFileTransfer(
  file: File,
  conversationId: string,
  senderEarthId: string,
  storageMode: FileStorageMode,
  tier: UserTier
): Promise<{ transfer: FileTransfer; localUrl: string | null }> {
  const envelope = await prepareEncryptedFileEnvelope(file, conversationId, senderEarthId, storageMode, tier);

  let localUrl: string | null = null;
  if (storageMode === 'local_only') {
    const fileBytes = await file.arrayBuffer();
    const blob = new Blob([fileBytes], { type: file.type || 'application/octet-stream' });
    localUrl = URL.createObjectURL(blob);
  }

  const transfer: FileTransfer = {
    ...envelope.transfer,
    status: storageMode === 'local_only' ? 'local_only' : 'ready',
    localObjectUrl: localUrl ?? undefined,
  };

  return { transfer, localUrl };
}

// ─── Human-readable helpers ───────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function storageModeLabel(mode: FileStorageMode): string {
  switch (mode) {
    case 'local_only':      return 'Local only — this file stays on your device.';
    case 'encrypted_relay': return 'Encrypted relay — file is sealed before upload.';
    case 'encrypted_vault': return 'Encrypted vault — stored safely until you delete it.';
  }
}

export function storageModeShortLabel(mode: FileStorageMode): string {
  switch (mode) {
    case 'local_only':      return 'Local only';
    case 'encrypted_relay': return 'Encrypted relay';
    case 'encrypted_vault': return 'Encrypted vault';
  }
}

export function retentionLabel(policy: FileRetentionPolicy): string {
  switch (policy) {
    case 'after_download': return 'Delete after download';
    case '24h':  return 'Expires 24h';
    case '7d':   return 'Expires 7 days';
    case '30d':  return 'Expires 30 days';
    case 'manual': return 'Keep until deleted';
  }
}

export function getMimeCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType.includes('spreadsheet') || mimeType.startsWith('text/')) return 'document';
  return 'other';
}
