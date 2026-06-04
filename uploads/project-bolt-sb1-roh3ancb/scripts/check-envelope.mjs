/**
 * EarthOS Communication Envelope Checker — Pass 115
 * Verifies the envelope module, adapters, consent mapping, shield category,
 * lifecycle states, and i18n keys are all present and consistent.
 * Run: node scripts/check-envelope.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let warnings = 0;
let errors = 0;

function pass(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.warn(`  ⚠ ${msg}`); warnings++; }
function fail(msg) { console.error(`  ✗ ${msg}`); errors++; }

function readOrFail(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) { fail(`Missing: ${rel}`); return null; }
  pass(`Exists: ${rel}`);
  return readFileSync(p, 'utf8');
}

function checkExport(content, file, name) {
  if (content.includes(name)) pass(`${file}: exports/contains ${name}`);
  else fail(`${file}: missing ${name}`);
}

function checkContent(content, file, needle, label) {
  if (content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: missing — ${label}`);
}

// ─── Part 1: Module existence ─────────────────────────────────────────────────
console.log('\n[envelope] Checking Communication Envelope Foundation...\n');
console.log('── Module files');

const envelope  = readOrFail('lib/qlpa/communicationEnvelope.ts');
const lifecycle = readOrFail('lib/qlpa/messageLifecycle.ts');
const consent   = readOrFail('lib/qlpa/consentEngine.ts');
const shield    = readOrFail('lib/qlpa/shieldPolicy.ts');
const index     = readOrFail('lib/qlpa/index.ts');

// ─── Part 2: CommunicationKind values ────────────────────────────────────────
if (envelope) {
  console.log('\n── CommunicationKind values');
  const kinds = [
    'text', 'voice', 'photo', 'video', 'file',
    'location', 'reaction', 'call', 'system', 'proposal', 'ritual',
  ];
  for (const kind of kinds) {
    checkContent(envelope, 'communicationEnvelope', `'${kind}'`, `kind: ${kind}`);
  }

  // ── State types
  console.log('\n── Envelope state types');
  checkExport(envelope, 'communicationEnvelope', 'EnvelopeConsentState');
  checkExport(envelope, 'communicationEnvelope', 'EnvelopeProtectionState');
  checkExport(envelope, 'communicationEnvelope', 'EnvelopeDeliveryState');
  checkExport(envelope, 'communicationEnvelope', 'EnvelopeRetentionMode');

  for (const s of ['allowed', 'waiting', 'blocked', 'revoked']) {
    checkContent(envelope, 'communicationEnvelope', `'${s}'`, `consent state: ${s}`);
  }
  for (const s of ['local-prototype', 'sealed', 'production-e2ee']) {
    checkContent(envelope, 'communicationEnvelope', `'${s}'`, `protection state: ${s}`);
  }
  for (const s of ['local', 'queued', 'ready', 'relayed', 'delivered', 'failed']) {
    checkContent(envelope, 'communicationEnvelope', `'${s}'`, `delivery state: ${s}`);
  }
  for (const s of ['manual', 'auto-clear', 'archive', 'view-once', 'expired']) {
    checkContent(envelope, 'communicationEnvelope', `'${s}'`, `retention mode: ${s}`);
  }

  // ── Struct fields
  console.log('\n── QLPACommunicationEnvelope fields');
  checkExport(envelope, 'communicationEnvelope', 'QLPACommunicationEnvelope');
  checkExport(envelope, 'communicationEnvelope', 'EnvelopeBody');
  checkExport(envelope, 'communicationEnvelope', 'EnvelopeAudit');
  for (const f of ['mimeType', 'textPreview', 'localUri', 'encryptedBlobId', 'sizeBytes',
                   'durationMs', 'width', 'height', 'filename', 'waveformPreview', 'thumbnailUri']) {
    checkContent(envelope, 'communicationEnvelope', f, `body field: ${f}`);
  }
  for (const f of ['ledgerEventIds', 'integrityHash', 'lifecycleState']) {
    checkContent(envelope, 'communicationEnvelope', f, `audit field: ${f}`);
  }

  // ── Adapters
  console.log('\n── Adapter functions');
  checkExport(envelope, 'communicationEnvelope', 'createTextEnvelopeFromMessage');
  checkExport(envelope, 'communicationEnvelope', 'envelopeToLifecycleState');
  checkExport(envelope, 'communicationEnvelope', 'getEnvelopeDisplayKind');

  // adapter returns kind: 'text'
  checkContent(envelope, 'communicationEnvelope', "kind:           'text'", 'createTextEnvelopeFromMessage sets kind: text');

  // getEnvelopeDisplayKind maps all 11 kinds
  const kindKeys = [
    'envelope.kindText', 'envelope.kindVoice', 'envelope.kindPhoto',
    'envelope.kindVideo', 'envelope.kindFile', 'envelope.kindLocation',
    'envelope.kindReaction', 'envelope.kindCall', 'envelope.kindSystem',
    'envelope.kindProposal', 'envelope.kindRitual',
  ];
  for (const key of kindKeys) {
    checkContent(envelope, 'communicationEnvelope', key, `i18n key mapped: ${key}`);
  }

  // Privacy rule: no DB or network calls
  const hasNetworkCall = envelope.includes('supabase') || envelope.includes('fetch(') || envelope.includes('axios');
  if (!hasNetworkCall) pass('communicationEnvelope: no database/network calls');
  else fail('communicationEnvelope: contains database or network call (must be pure)');
}

// ─── Part 3: lifecycle states ─────────────────────────────────────────────────
if (lifecycle) {
  console.log('\n── Lifecycle states');
  for (const s of ['draft', 'reflected', 'consent_checked', 'encrypted_local',
                   'stored_local', 'relay_ready', 'sent', 'delivered', 'cleared',
                   'blocked', 'failed']) {
    checkContent(lifecycle, 'messageLifecycle', `'${s}'`, `lifecycle state: ${s}`);
  }
  checkContent(lifecycle, 'messageLifecycle', 'isError:     true', 'error states have isError: true');
}

// ─── Part 4: consent engine action map ───────────────────────────────────────
if (consent) {
  console.log('\n── ConsentAction map');
  for (const action of ['send-message', 'upload-file', 'share-location', 'start-call']) {
    checkContent(consent, 'consentEngine', `'${action}'`, `action: ${action}`);
  }
  checkContent(consent, 'consentEngine', 'CommunicationKind', 'CommunicationKind mapping comment present');
  checkContent(consent, 'consentEngine', 'start-call', 'start-call in ACTION_MIN_TRUST');
}

// ─── Part 5: shield category mapping ─────────────────────────────────────────
if (shield) {
  console.log('\n── Shield envelope category mapping');
  checkExport(shield, 'shieldPolicy', 'EnvelopeShieldCategory');
  checkExport(shield, 'shieldPolicy', 'getShieldCategoryForEnvelopeKind');
  for (const cat of ['text', 'media', 'file', 'location', 'live', 'system']) {
    checkContent(shield, 'shieldPolicy', `'${cat}'`, `shield category: ${cat}`);
  }
  // voice/photo/video → media; call → live
  checkContent(shield, 'shieldPolicy', "case 'voice':", 'voice → media mapping');
  checkContent(shield, 'shieldPolicy', "case 'photo':", 'photo → media mapping');
  checkContent(shield, 'shieldPolicy', "case 'call':", 'call → live mapping');
  checkContent(shield, 'shieldPolicy', "case 'location':", 'location → location mapping');
}

// ─── Part 6: index.ts re-exports ─────────────────────────────────────────────
if (index) {
  console.log('\n── index.ts re-exports');
  checkContent(index, 'index.ts', "'./communicationEnvelope'", 're-exports communicationEnvelope');
}

// ─── Part 7: i18n keys in en.json ────────────────────────────────────────────
const enJson = readOrFail('lib/i18n/locales/en.json');
if (enJson) {
  console.log('\n── i18n envelope keys (en)');
  for (const kind of ['kindText', 'kindVoice', 'kindPhoto', 'kindVideo', 'kindFile',
                       'kindLocation', 'kindReaction', 'kindCall', 'kindSystem',
                       'kindProposal', 'kindRitual']) {
    checkContent(enJson, 'en.json', `"${kind}"`, `key: envelope.${kind}`);
  }
}

// Verify all 7 locales have the envelope section
console.log('\n── envelope section in all locales');
for (const locale of ['en', 'de', 'es', 'fr', 'id', 'it', 'pt']) {
  const loc = readFileSync(resolve(root, `lib/i18n/locales/${locale}.json`), 'utf8');
  if (loc.includes('"envelope"')) pass(`${locale}.json: envelope section present`);
  else fail(`${locale}.json: missing envelope section`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[envelope] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[envelope] FAILED — fix errors before proceeding.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[envelope] Passed with warnings.');
} else {
  console.log('[envelope] All checks passed.');
}
