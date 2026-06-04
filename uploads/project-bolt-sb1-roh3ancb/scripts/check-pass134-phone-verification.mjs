/**
 * QLPA Pass 134 Phone Verification Check
 *
 * Verifies that all Pass 134 additions are in place:
 * - Reset first-run hint button present (removes earthos.firstConversationCreated.v1 only)
 * - Pass 134 focus block present
 * - Go test flow checklist present (8 items)
 * - No network calls
 * - Phone QA remains Developer-only (SettingsTab gate)
 * - All i18n keys present in all 7 locales
 *
 * Run: node scripts/check-pass134-phone-verification.mjs
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

console.log('\n[check-pass134-phone-verification] Pass 134 Phone Verification Audit\n');

// ─── PhoneQAPanel.tsx: Pass 134 additions ─────────────────────────────────────
console.log('── PhoneQAPanel.tsx: Pass 134 additions');
const panel = readOrFail('components/messaging/PhoneQAPanel.tsx');
if (panel) {
  // Reset first-run hint
  check(panel, 'PhoneQAPanel.tsx',
    'earthos.firstConversationCreated.v1',
    'FIRST_RUN_HINT_KEY references earthos.firstConversationCreated.v1');
  check(panel, 'PhoneQAPanel.tsx',
    'localStorage.removeItem(FIRST_RUN_HINT_KEY)',
    'resetFirstRunHint removes only the first-run hint key');
  check(panel, 'PhoneQAPanel.tsx',
    'data-qlpa-reset-first-run-hint',
    'data-qlpa-reset-first-run-hint attribute on reset button');
  check(panel, 'PhoneQAPanel.tsx',
    'Reset first-run hint',
    '"Reset first-run hint" button label present');

  // Pass 134 focus block
  check(panel, 'PhoneQAPanel.tsx',
    'data-qlpa-pass134-focus',
    'data-qlpa-pass134-focus attribute present');
  check(panel, 'PhoneQAPanel.tsx',
    'PASS134_FOCUS_ITEMS',
    'PASS134_FOCUS_ITEMS array present');
  check(panel, 'PhoneQAPanel.tsx',
    'Root/Messaging Φ-card fits without top masking',
    'Focus item 1: Root/Messaging Φ-card');
  check(panel, 'PhoneQAPanel.tsx',
    'New button is clear in Simple mode',
    'Focus item 2: New button clarity');
  check(panel, 'PhoneQAPanel.tsx',
    'First-run hint appears before first conversation created',
    'Focus item 3: First-run hint');
  check(panel, 'PhoneQAPanel.tsx',
    'Empty Journey starts at top of view',
    'Focus item 4: Empty Journey top');
  check(panel, 'PhoneQAPanel.tsx',
    'Send test message stays disabled until member invited',
    'Focus item 5: Send test message disabled');
  check(panel, 'PhoneQAPanel.tsx',
    'Mobile sheets scroll without background movement',
    'Focus item 6: Sheet scroll');

  // Go test flow checklist
  check(panel, 'PhoneQAPanel.tsx',
    'data-qlpa-go-test-flow',
    'data-qlpa-go-test-flow container attribute present');
  check(panel, 'PhoneQAPanel.tsx',
    'GO_TEST_FLOW_ITEMS',
    'GO_TEST_FLOW_ITEMS array present');
  check(panel, 'PhoneQAPanel.tsx',
    'data-qlpa-go-test-item',
    'data-qlpa-go-test-item per-item attribute present');
  check(panel, 'PhoneQAPanel.tsx',
    'Open Root orb panel',
    'Go test flow item 1: Open Root orb');
  check(panel, 'PhoneQAPanel.tsx',
    'Open Messaging orb panel',
    'Go test flow item 2: Open Messaging orb');
  check(panel, 'PhoneQAPanel.tsx',
    'Confirm New button visible',
    'Go test flow item 3: Confirm New button');
  check(panel, 'PhoneQAPanel.tsx',
    'Create Direct conversation',
    'Go test flow item 4: Create Direct conversation');
  check(panel, 'PhoneQAPanel.tsx',
    'Confirm Empty Journey at top',
    'Go test flow item 5: Confirm Empty Journey');
  check(panel, 'PhoneQAPanel.tsx',
    'Invite member',
    'Go test flow item 6: Invite member');
  // Pass 137: renamed from 'Confirm Send test message activates' to reflect always-enabled behavior
  check(panel, 'PhoneQAPanel.tsx',
    'Create local test message (always enabled)',
    'Go test flow item 7: Create local test message');
  check(panel, 'PhoneQAPanel.tsx',
    'Send local test message',
    'Go test flow item 8: Send local test message');

  // Go test flow uses 3-state mechanism
  check(panel, 'PhoneQAPanel.tsx', 'cycleGoTestFlow', 'cycleGoTestFlow handler present');
  check(panel, 'PhoneQAPanel.tsx', 'goTestFlow', 'goTestFlow state present');
  check(panel, 'PhoneQAPanel.tsx', 'resetFirstRunHint', 'resetFirstRunHint handler present');
  check(panel, 'PhoneQAPanel.tsx', 'resetHintFlash', 'resetHintFlash state present');

  // Safety: only removes the one key
  checkAbsent(panel, 'PhoneQAPanel.tsx',
    'localStorage.clear()',
    'resetFirstRunHint does NOT call localStorage.clear()');

  // No network calls
  console.log('\n── PhoneQAPanel.tsx: no network calls');
  checkAbsent(panel, 'PhoneQAPanel.tsx', 'fetch(',         'No fetch() calls');
  checkAbsent(panel, 'PhoneQAPanel.tsx', 'supabase',       'No supabase calls');
  checkAbsent(panel, 'PhoneQAPanel.tsx', 'XMLHttpRequest', 'No XMLHttpRequest');

  // SSR guard still present
  check(panel, 'PhoneQAPanel.tsx',
    "typeof window === 'undefined'",
    'SSR guard still present');
}

// ─── SettingsTab.tsx: Developer-only gate still in place ──────────────────────
console.log('\n── SettingsTab.tsx: Developer-only gate');
const settings = readOrFail('components/messaging/SettingsTab.tsx');
if (settings) {
  check(settings, 'SettingsTab.tsx', "from './PhoneQAPanel'", 'PhoneQAPanel imported');
  check(settings, 'SettingsTab.tsx', '<PhoneQAPanel',         'PhoneQAPanel rendered');
  check(settings, 'SettingsTab.tsx', 'isDeveloper(viewLevel)', 'isDeveloper gate present');
  const devBlockIdx = settings.indexOf('isDeveloper(viewLevel)');
  const phoneQaIdx  = settings.indexOf('<PhoneQAPanel');
  if (devBlockIdx !== -1 && phoneQaIdx !== -1 && phoneQaIdx > devBlockIdx) {
    pass('SettingsTab.tsx: PhoneQAPanel still inside isDeveloper gate');
  } else {
    fail('SettingsTab.tsx: PhoneQAPanel is NOT inside isDeveloper gate');
  }
}

// ─── i18n: Pass 134 keys in all 7 locales ─────────────────────────────────────
console.log('\n── i18n locales: Pass 134 keys');
const LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'id'];
const REQUIRED_P134_KEYS = [
  '"pass134FocusTitle"',
  '"pass134FocusItem1"',
  '"pass134FocusItem2"',
  '"pass134FocusItem3"',
  '"pass134FocusItem4"',
  '"pass134FocusItem5"',
  '"pass134FocusItem6"',
  '"resetFirstRunHint"',
  '"resetFirstRunHintDone"',
  '"goTestFlowTitle"',
  '"goTestFlowItem1"',
  '"goTestFlowItem2"',
  '"goTestFlowItem3"',
  '"goTestFlowItem4"',
  '"goTestFlowItem5"',
  '"goTestFlowItem6"',
  '"goTestFlowItem7"',
  '"goTestFlowItem8"',
];
for (const lang of LOCALES) {
  const p = resolve(root, `lib/i18n/locales/${lang}.json`);
  if (!existsSync(p)) { fail(`Locale file missing: ${lang}.json`); continue; }
  const content = readFileSync(p, 'utf8');
  for (const key of REQUIRED_P134_KEYS) {
    if (content.includes(key)) pass(`${lang}.json: phoneQa${key} present`);
    else fail(`${lang}.json: phoneQa${key} MISSING`);
  }
}

// ─── package.json: check:pass134 script registered ────────────────────────────
console.log('\n── package.json: check:pass134 script');
const pkg = readOrFail('package.json');
if (pkg) {
  check(pkg, 'package.json', 'check-pass134-phone-verification', 'check:pass134 script registered');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[check-pass134-phone-verification] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[check-pass134-phone-verification] FAILED — Pass 134 checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[check-pass134-phone-verification] Passed with warnings.');
} else {
  console.log('[check-pass134-phone-verification] All Pass 134 phone verification checks passed.');
}
