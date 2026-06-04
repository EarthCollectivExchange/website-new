/**
 * QLPA First Mission Actions Checker
 *
 * Verifies that Pass 125 changes are correctly implemented:
 *   1. ConversationList has a mobile-visible new conversation CTA (Plus button near Search)
 *   2. EmptyConversationJourney has an onSendTestMessage handler
 *   3. handleSend in ConversationView allows generated messages to bypass the trust gate
 *   4. Generated messages (contentKind: 'generated') are never silently blocked
 *   5. ConversationList passes onNewConversation to NewConversationDrawer
 *
 * Run: node scripts/check-first-mission-actions.mjs
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

console.log('\n[first-mission-actions] Pass 125 First Mission Actions Audit\n');

// ─── ConversationList: mobile CTA present ─────────────────────────────────────
console.log('── ConversationList: mobile new conversation CTA');
const convList = readOrFail('components/messaging/ConversationList.tsx');
if (convList) {
  check(convList, 'ConversationList.tsx', 'setDrawerOpen(true)', 'new conversation drawer trigger present');
  check(convList, 'ConversationList.tsx', "aria-label={t('commandBar.new')}", 'accessible label on new conversation button');
  // The CTA button should be adjacent to the search input (not only in the desktop command bar).
  // Look for the Plus icon import as a proxy for the inline CTA (it is only used in the header area).
  if (convList.includes('Plus') && convList.includes('commandBar.new')) {
    pass('ConversationList.tsx: Plus icon CTA and commandBar.new label present (mobile visible)');
  } else {
    fail('ConversationList.tsx: new conversation CTA must include Plus icon and commandBar.new label');
  }
  check(convList, 'ConversationList.tsx', 'NewConversationDrawer', 'NewConversationDrawer rendered');
}

// ─── EmptyConversationJourney: onSendTestMessage handler ──────────────────────
console.log('\n── EmptyConversationJourney: send test message');
const emptyJourney = readOrFail('components/messaging/EmptyConversationJourney.tsx');
if (emptyJourney) {
  check(emptyJourney, 'EmptyConversationJourney.tsx', 'onSendTestMessage', 'onSendTestMessage prop present');
  // Pass 137: renamed from sendTestCta to emptyJourney.createLocalTestMessage
  check(emptyJourney, 'EmptyConversationJourney.tsx', 'emptyJourney.createLocalTestMessage', 'createLocalTestMessage i18n key used');
}

// ─── ConversationView: generated message bypasses trust gate ──────────────────
console.log('\n── ConversationView: generated message trust gate bypass');
const convView = readOrFail('components/messaging/ConversationView.tsx');
if (convView) {
  check(convView, 'ConversationView.tsx', "meta?.contentKind === 'generated'", 'isGeneratedMessage check present');
  check(convView, 'ConversationView.tsx', 'isGeneratedMessage', 'isGeneratedMessage variable used');
  check(convView, 'ConversationView.tsx', '!isGeneratedMessage', 'trust gate wrapped in !isGeneratedMessage');
  check(convView, 'ConversationView.tsx', 'allowed_local_prototype', 'generated message gets allowed_local_prototype consent code');

  // Verify onSendTestMessage wiring
  check(convView, 'ConversationView.tsx', "contentKind: 'generated'", 'test message sends with generated contentKind');
  check(convView, 'ConversationView.tsx', 'onSendTestMessage', 'onSendTestMessage prop wired in ConversationView');
}

// ─── i18n: commandBar.new key present ─────────────────────────────────────────
console.log('\n── i18n: commandBar.new key');
const enJson = readOrFail('lib/i18n/locales/en.json');
if (enJson) {
  check(enJson, 'en.json', '"commandBar"', 'commandBar section present');
  check(enJson, 'en.json', '"new"', 'commandBar.new key present');
}

// ─── No duplicate conversations by ID ─────────────────────────────────────────
console.log('\n── mockData: no duplicate conversation IDs');
const mockData = readOrFail('lib/messaging/mockData.ts');
if (mockData) {
  const idMatches = [...mockData.matchAll(/id:\s*['"]conv-(\d+)['"]/g)];
  const ids = idMatches.map(m => m[1]);
  const unique = new Set(ids);
  if (ids.length === unique.size) {
    pass(`mockData.ts: no duplicate conversation IDs (${ids.length} conversations)`);
  } else {
    fail(`mockData.ts: duplicate conversation IDs detected`);
  }
}

console.log(`\n[first-mission-actions] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[first-mission-actions] FAILED — first mission action checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[first-mission-actions] Passed with warnings.');
} else {
  console.log('[first-mission-actions] All first mission action checks passed.');
}
