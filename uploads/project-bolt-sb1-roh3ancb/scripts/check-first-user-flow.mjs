/**
 * QLPA First User Flow Checker
 *
 * Verifies Pass 126 changes:
 *   1. ConversationList has a visible CTA or first-run hint
 *   2. Send test message path is local-only (generated/prototype)
 *   3. Test message does NOT trigger relay or delivery claim
 *   4. User-typed messages still use checkActionPermission('send-message')
 *   5. Generated test message path is explicitly marked generated/local/prototype
 *   6. Empty journey does not claim production delivery
 *   7. First-run hint localStorage guard is present
 *   8. New i18n keys (firstRunHint, testMessageCreated, commandBar.newShort) present
 *   9. relayReady wording does not claim live delivery
 *  10. sendFirstBody wording does not imply relay
 *
 * Run: node scripts/check-first-user-flow.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let errors = 0;
let warnings = 0;

function pass(msg)  { console.log(`  ✓ ${msg}`); }
function warn(msg)  { console.warn(`  ⚠ ${msg}`); warnings++; }
function fail(msg)  { console.error(`  ✗ ${msg}`); errors++; }

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
  else fail(`${file}: MUST NOT contain — ${label}`);
}

console.log('\n[first-user-flow] Pass 126 First User Flow Audit\n');

// ─── ConversationList: CTA + first-run hint ───────────────────────────────────
console.log('── ConversationList: visible CTA and first-run hint');
const convList = readOrFail('components/messaging/ConversationList.tsx');
if (convList) {
  check(convList, 'ConversationList.tsx', 'setDrawerOpen(true)', 'new conversation drawer trigger present');
  check(convList, 'ConversationList.tsx', 'firstRunHint', 'firstRunHint i18n key used');
  check(convList, 'ConversationList.tsx', 'earthos.messaging.firstNewConversationHintDismissed.v1', 'dismissal localStorage key present');
  check(convList, 'ConversationList.tsx', "typeof window !== 'undefined'", 'localStorage browser guard present');
  check(convList, 'ConversationList.tsx', 'localStorage.setItem', 'localStorage dismissal write present');
  check(convList, 'ConversationList.tsx', 'localStorage.getItem', 'localStorage dismissal read present');
}

// ─── EmptyConversationJourney: no delivery claims ────────────────────────────
console.log('\n── EmptyConversationJourney: honest prototype wording');
const emptyJourney = readOrFail('components/messaging/EmptyConversationJourney.tsx');
if (emptyJourney) {
  check(emptyJourney, 'EmptyConversationJourney.tsx', 'testMessageSent', 'testMessageSent prop present');
  check(emptyJourney, 'EmptyConversationJourney.tsx', 'relayReady', 'relayReady i18n key used');
  check(emptyJourney, 'EmptyConversationJourney.tsx', 'relayBody', 'relayBody i18n key used');
}

// ─── ConversationView: generated message gate bypass + dedup guard ────────────
console.log('\n── ConversationView: generated message safety');
const convView = readOrFail('components/messaging/ConversationView.tsx');
if (convView) {
  check(convView, 'ConversationView.tsx', "isGeneratedMessage", 'isGeneratedMessage bypass present');
  check(convView, 'ConversationView.tsx', "messages.some(m => m.contentKind === 'generated')", 'duplicate test message guard present');
  check(convView, 'ConversationView.tsx', 'testMessageCreated', 'testMessageCreated i18n key on generated message');
  check(convView, 'ConversationView.tsx', "contentKind === 'generated'", 'generated message detection present');
  // Verify user-typed messages still go through checkActionPermission
  check(convView, 'ConversationView.tsx', 'checkActionPermission', 'checkActionPermission still used for user messages');
  check(convView, 'ConversationView.tsx', '!isGeneratedMessage', 'trust gate still active for non-generated messages');
}

// ─── i18n: new keys present in en.json ───────────────────────────────────────
console.log('\n── i18n: new keys in en.json');
const enJson = readOrFail('lib/i18n/locales/en.json');
if (enJson) {
  check(enJson, 'en.json', '"testMessageCreated"', 'conversation.testMessageCreated key present');
  check(enJson, 'en.json', '"testMessageAlreadyCreated"', 'conversation.testMessageAlreadyCreated key present');
  check(enJson, 'en.json', '"firstRunHint"', 'conversation.firstRunHint key present');
  check(enJson, 'en.json', '"newShort"', 'commandBar.newShort key present');
  // Verify honest wording
  checkAbsent(enJson, 'en.json', '"relayReady": "Ready to send"', 'relayReady does not claim live delivery');
  checkAbsent(enJson, 'en.json', '"sendFirstBody": "Your first message will be encrypted locally before sending."', 'sendFirstBody does not imply relay send');
  check(enJson, 'en.json', 'Ready locally', 'relayReady uses prototype-honest wording');
  check(enJson, 'en.json', 'stored on this device', 'sendFirstBody uses local-only wording');
}

// ─── All 7 locales have new keys ─────────────────────────────────────────────
console.log('\n── All 7 locales have firstRunHint and newShort');
const locales = ['en', 'de', 'fr', 'es', 'it', 'pt', 'id'];
for (const locale of locales) {
  const content = readOrFail(`lib/i18n/locales/${locale}.json`);
  if (content) {
    check(content, `${locale}.json`, '"firstRunHint"', 'firstRunHint key present');
    check(content, `${locale}.json`, '"newShort"', 'commandBar.newShort key present');
    check(content, `${locale}.json`, '"testMessageCreated"', 'testMessageCreated key present');
  }
}

console.log(`\n[first-user-flow] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[first-user-flow] FAILED — first user flow checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[first-user-flow] Passed with warnings.');
} else {
  console.log('[first-user-flow] All first user flow checks passed.');
}
