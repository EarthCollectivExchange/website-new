/**
 * QLPA Communication Capability Matrix Check
 *
 * Verifies:
 * - communicationCapabilityMatrix.ts exists with all 15 CapabilityKind values
 * - All 9 helper functions are exported
 * - CapabilityPolicy interface has all 19 required fields
 * - Safety rules encoded in the matrix (trust levels, consent, recording)
 * - EarthCoin / governance / bridge boundary protections
 * - No React or browser imports
 * - Exported from lib/qlpa/index.ts
 * - All capability.* i18n keys present in all 7 locales
 *
 * Run: node scripts/check-communication-capability-matrix.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let errors = 0;

function pass(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); errors++; }

function readOrFail(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) { fail(`Missing: ${rel}`); return null; }
  pass(`Exists: ${rel}`);
  return readFileSync(p, 'utf8');
}

function check(content, file, needle, label) {
  if (content && content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: MISSING — ${label}`);
}

function checkAbsent(content, file, needle, label) {
  if (content && !content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: SHOULD BE ABSENT — ${label}`);
}

// ─── 1. Matrix file exists ────────────────────────────────────────────────────

console.log('\n[1] Matrix file');
const matrixFile = 'lib/qlpa/communicationCapabilityMatrix.ts';
const matrix = readOrFail(matrixFile);

// ─── 2. All 15 CapabilityKind values ─────────────────────────────────────────

console.log('\n[2] 15 CapabilityKind values');
const KINDS = [
  'text-message', 'voice-note', 'audio-call', 'video-call',
  'photo-message', 'video-message', 'file-transfer', 'location-message',
  'contact-card', 'event-invite', 'governance-signal', 'earthos-public-signal',
  'earthcoin-signal', 'emergency-report', 'system-notice',
];
for (const kind of KINDS) {
  check(matrix, matrixFile, `'${kind}'`, `CapabilityKind: '${kind}'`);
}

// ─── 3. CapabilityPolicy fields (19) ─────────────────────────────────────────

console.log('\n[3] CapabilityPolicy interface fields');
const FIELDS = [
  'kind', 'labelKey', 'releaseCapability', 'defaultStorage',
  'requiresConsent', 'minimumTrustLevel',
  'canBeForwarded', 'canBecomePublicSignal', 'canBecomeEarthCoinRecord', 'canBecomeGovernanceRecord',
  'requiresMediaPermission', 'requiresRecordingConsent', 'requiresShieldCheck',
  'allowedInDirect', 'allowedInGroup', 'allowedInCommunity',
  'metadataExposure', 'retentionClass', 'exportClass',
];
for (const field of FIELDS) {
  check(matrix, matrixFile, field, `Policy field: ${field}`);
}

// ─── 4. 9 exported helper functions ──────────────────────────────────────────

console.log('\n[4] 9 helper functions exported');
const HELPERS = [
  'getCapabilityPolicy',
  'canCapabilityRunInTrust',
  'requiresExplicitConsent',
  'requiresRecordingNotice',
  'canCapabilityCrossEarthOSBridge',
  'canCapabilityCrossEarthCoinBoundary',
  'canCapabilityEnterGovernance',
  'getCapabilityShieldCategory',
  'getCapabilityReleaseStatus',
];
for (const fn of HELPERS) {
  check(matrix, matrixFile, `export function ${fn}`, `exported: ${fn}`);
}

// ─── Extract policy block helper (defined early for use below) ────────────────

// Extract a policy object block — search for the entry inside CAPABILITY_MATRIX object
// by finding the indented key pattern `  'kind': {`
function extractPolicyBlock(src, kind) {
  if (!src) return '';
  const marker = `  '${kind}': {`;
  const start = src.indexOf(marker);
  if (start === -1) return '';
  return src.slice(start, start + 900);
}

// ─── 5. Safety rules ─────────────────────────────────────────────────────────

console.log('\n[5] Safety rules — trust levels');
check(matrix, matrixFile, `'audio-call':`, 'audio-call entry exists');
check(matrix, matrixFile, `'video-call':`, 'video-call entry exists');
check(matrix, matrixFile, `'location-message':`, 'location-message entry exists');

const audioCallBlock = extractPolicyBlock(matrix, 'audio-call');
if (audioCallBlock.includes("minimumTrustLevel: 'trusted'")) pass(`${matrixFile}: audio-call minimumTrustLevel=trusted`);
else fail(`${matrixFile}: audio-call must require minimumTrustLevel=trusted`);

const locationBlock = extractPolicyBlock(matrix, 'location-message');
if (locationBlock.includes("minimumTrustLevel: 'trusted'")) pass(`${matrixFile}: location-message minimumTrustLevel=trusted`);
else fail(`${matrixFile}: location-message must require minimumTrustLevel=trusted`);

console.log('\n[6] Safety rules — recording consent');
for (const kind of ['audio-call', 'video-call', 'voice-note', 'video-message']) {
  const block = extractPolicyBlock(matrix, kind);
  if (block.includes('requiresRecordingConsent: true')) pass(`${matrixFile}: ${kind} requiresRecordingConsent=true`);
  else fail(`${matrixFile}: ${kind} must have requiresRecordingConsent=true`);
}

const textBlockFull = extractPolicyBlock(matrix, 'text-message');
if (textBlockFull.includes('requiresRecordingConsent: false')) pass(`${matrixFile}: text-message requiresRecordingConsent=false`);
else fail(`${matrixFile}: text-message must have requiresRecordingConsent=false`);

const audioCallBlockFull = extractPolicyBlock(matrix, 'audio-call');
const locationBlockFull = extractPolicyBlock(matrix, 'location-message');

console.log('\n[7] Safety rules — ephemeral retention for calls and location');
if (audioCallBlockFull.includes("retentionClass: 'ephemeral'")) pass(`${matrixFile}: audio-call retentionClass=ephemeral`);
else fail(`${matrixFile}: audio-call must have retentionClass=ephemeral`);

if (locationBlockFull.includes("retentionClass: 'ephemeral'")) pass(`${matrixFile}: location-message retentionClass=ephemeral`);
else fail(`${matrixFile}: location-message must have retentionClass=ephemeral`);

console.log('\n[8] Safety rules — not-exportable for calls and location');
if (audioCallBlockFull.includes("exportClass: 'not-exportable'")) pass(`${matrixFile}: audio-call exportClass=not-exportable`);
else fail(`${matrixFile}: audio-call must have exportClass=not-exportable`);

if (locationBlockFull.includes("exportClass: 'not-exportable'")) pass(`${matrixFile}: location-message exportClass=not-exportable`);
else fail(`${matrixFile}: location-message must have exportClass=not-exportable`);

// ─── 9. EarthCoin / Governance / Bridge protections ──────────────────────────

console.log('\n[9] EarthCoin / Governance / Bridge boundary rules');

// Private content (text, voice, photo, file) must NOT become EarthCoin/governance records
for (const kind of ['text-message', 'voice-note', 'photo-message', 'file-transfer', 'audio-call', 'video-call']) {
  const block = extractPolicyBlock(matrix, kind);
  if (block.includes('canBecomeEarthCoinRecord: false')) pass(`${matrixFile}: ${kind} canBecomeEarthCoinRecord=false`);
  else fail(`${matrixFile}: ${kind} must NOT have canBecomeEarthCoinRecord=true`);
  if (block.includes('canBecomeGovernanceRecord: false')) pass(`${matrixFile}: ${kind} canBecomeGovernanceRecord=false`);
  else fail(`${matrixFile}: ${kind} must NOT have canBecomeGovernanceRecord=true`);
}

// governance-signal IS the governance record
const govBlock = extractPolicyBlock(matrix, 'governance-signal');
if (govBlock.includes('canBecomeGovernanceRecord: true')) pass(`${matrixFile}: governance-signal canBecomeGovernanceRecord=true`);
else fail(`${matrixFile}: governance-signal must have canBecomeGovernanceRecord=true`);
if (govBlock.includes("exportClass: 'bridge-gated'")) pass(`${matrixFile}: governance-signal exportClass=bridge-gated`);
else fail(`${matrixFile}: governance-signal must have exportClass=bridge-gated`);

// earthcoin-signal IS the EarthCoin record
const ecBlock = extractPolicyBlock(matrix, 'earthcoin-signal');
if (ecBlock.includes('canBecomeEarthCoinRecord: true')) pass(`${matrixFile}: earthcoin-signal canBecomeEarthCoinRecord=true`);
else fail(`${matrixFile}: earthcoin-signal must have canBecomeEarthCoinRecord=true`);
if (ecBlock.includes("exportClass: 'bridge-gated'")) pass(`${matrixFile}: earthcoin-signal exportClass=bridge-gated`);
else fail(`${matrixFile}: earthcoin-signal must have exportClass=bridge-gated`);

// public signals require bridge-gated
const publicBlock = extractPolicyBlock(matrix, 'earthos-public-signal');
if (publicBlock.includes("exportClass: 'bridge-gated'")) pass(`${matrixFile}: earthos-public-signal exportClass=bridge-gated`);
else fail(`${matrixFile}: earthos-public-signal must have exportClass=bridge-gated`);

// ─── 10. No React / browser imports ──────────────────────────────────────────

console.log('\n[10] No React or browser imports');
checkAbsent(matrix, matrixFile, "from 'react'", 'no React import');
checkAbsent(matrix, matrixFile, 'from "react"', 'no React import (double-quote)');
checkAbsent(matrix, matrixFile, 'document.', 'no document usage');
checkAbsent(matrix, matrixFile, 'window.', 'no window usage');
checkAbsent(matrix, matrixFile, 'localStorage', 'no localStorage usage');

// ─── 11. system-notice: requiresConsent=false ────────────────────────────────

console.log('\n[11] system-notice consent rule');
const systemBlock = extractPolicyBlock(matrix, 'system-notice');
if (systemBlock.includes('requiresConsent: false')) pass(`${matrixFile}: system-notice requiresConsent=false`);
else fail(`${matrixFile}: system-notice must have requiresConsent=false (system-generated)`);

// ─── 12. emergency-report: requiresShieldCheck=false ─────────────────────────

console.log('\n[12] emergency-report shield bypass');
const emergBlock = extractPolicyBlock(matrix, 'emergency-report');
if (emergBlock.includes('requiresShieldCheck: false')) pass(`${matrixFile}: emergency-report requiresShieldCheck=false`);
else fail(`${matrixFile}: emergency-report must have requiresShieldCheck=false (safety bypass)`);
if (emergBlock.includes("minimumTrustLevel: 'unknown'")) pass(`${matrixFile}: emergency-report minimumTrustLevel=unknown`);
else fail(`${matrixFile}: emergency-report must have minimumTrustLevel=unknown`);

// ─── 13. ALL_CAPABILITY_KINDS exported ───────────────────────────────────────

console.log('\n[13] ALL_CAPABILITY_KINDS export');
check(matrix, matrixFile, 'export const ALL_CAPABILITY_KINDS', 'ALL_CAPABILITY_KINDS exported');

// ─── 14. CAPABILITY_MATRIX exported ─────────────────────────────────────────

console.log('\n[14] CAPABILITY_MATRIX export');
check(matrix, matrixFile, 'export const CAPABILITY_MATRIX', 'CAPABILITY_MATRIX exported');

// ─── 15. Exported from lib/qlpa/index.ts ─────────────────────────────────────

console.log('\n[15] Export from lib/qlpa/index.ts');
const qlpaIndex = readOrFail('lib/qlpa/index.ts');
check(qlpaIndex, 'lib/qlpa/index.ts', "'./communicationCapabilityMatrix'", 'communicationCapabilityMatrix re-exported');

// ─── 16. i18n — capability.* keys in all 7 locales ───────────────────────────

console.log('\n[16] i18n — capability.* keys in all 7 locales');

const I18N_KEYS = [
  'textMessage', 'voiceNote', 'audioCall', 'videoCall',
  'photoMessage', 'videoMessage', 'fileTransfer', 'locationMessage',
  'contactCard', 'eventInvite', 'governanceSignal', 'earthosPublicSignal',
  'earthcoinSignal', 'emergencyReport', 'systemNotice',
];

const LOCALES = ['en', 'fr', 'de', 'es', 'it', 'pt', 'id'];

for (const locale of LOCALES) {
  const file = `lib/i18n/locales/${locale}.json`;
  const content = readOrFail(file);
  if (!content) continue;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    fail(`${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!parsed.capability) {
    fail(`${file}: MISSING 'capability' section`);
    continue;
  }

  for (const key of I18N_KEYS) {
    if (parsed.capability[key] && parsed.capability[key].trim().length > 0) {
      pass(`${file}: capability.${key}`);
    } else {
      fail(`${file}: MISSING capability.${key}`);
    }
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────');
if (errors === 0) {
  console.log('  PASS — Communication Capability Matrix check complete. 0 errors.');
} else {
  console.error(`  FAIL — ${errors} error(s) found.`);
  process.exit(1);
}
