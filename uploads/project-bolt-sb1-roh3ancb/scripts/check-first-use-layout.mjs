/**
 * QLPA First-Use Flow & Layout Check — Pass 133 (updated: Visual Re-Alignment Pass 001)
 *
 * Verifies that all Pass 133 changes are in place:
 * - QLPA mobile layout constants in layoutTokens.ts
 * - app/page.tsx is the source base index (not the messaging orb launcher)
 * - First-run hint uses localStorage flag not conversations.length
 * - EmptyConversationJourney has no duplicate Invite CTA
 * - PhoneQAPanel wording updated
 *
 * Run: node scripts/check-first-use-layout.mjs
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

console.log('\n[check-first-use-layout] Pass 133 First-Use Flow & Layout Audit\n');

// ─── layoutTokens.ts: new constants ──────────────────────────────────────────
console.log('── lib/qlpa/layoutTokens.ts: Pass 133 constants');
const tokens = readOrFail('lib/qlpa/layoutTokens.ts');
if (tokens) {
  check(tokens, 'layoutTokens.ts', 'QLPA_SPACE_8',               'QLPA_SPACE_8 constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_SPACE_13',              'QLPA_SPACE_13 constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_SPACE_21',              'QLPA_SPACE_21 constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_SPACE_34',              'QLPA_SPACE_34 constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_SPACE_55',              'QLPA_SPACE_55 constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_SPACE_89',              'QLPA_SPACE_89 constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_PANEL_MAX_H_RATIO',     'QLPA_PANEL_MAX_H_RATIO constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_ROOT_CARD_MAX_H_RATIO', 'QLPA_ROOT_CARD_MAX_H_RATIO constant present');
  check(tokens, 'layoutTokens.ts', 'QLPA_ROOT_CARD_WIDTH_RATIO', 'QLPA_ROOT_CARD_WIDTH_RATIO constant present');
  check(tokens, 'layoutTokens.ts', '0.77',                       'ROOT_CARD_MAX_H_RATIO = 0.77');
  check(tokens, 'layoutTokens.ts', '0.90',                       'ROOT_CARD_WIDTH_RATIO = 0.90');
  check(tokens, 'layoutTokens.ts', '0.82',                       'PANEL_MAX_H_RATIO = 0.82');
}

// ─── app/page.tsx: source base index (Visual Re-Alignment Pass 001) ──────────
// Pass 133 verified BottomSheet geometry for the messaging orb launcher.
// After Visual Re-Alignment Pass 001, app/page.tsx is the source base index.
// The BottomSheet and messaging orb launcher are no longer on this page.
console.log('\n── app/page.tsx: source base index');
const landing = readOrFail('app/page.tsx');
if (landing) {
  check(landing, 'page.tsx', 'EarthOS QLPA Matrix',    'page.tsx: source base title present');
  check(landing, 'page.tsx', 'SOURCE BASE',            'page.tsx: SOURCE BASE badge present');
  checkAbsent(landing, 'page.tsx', "'78svh'",          'Old 78svh value removed');
  checkAbsent(landing, 'page.tsx', "'102%'",           'Old 102% translateY removed');
  checkAbsent(landing, 'page.tsx', "router.push('/messaging')", 'No hard-link to /messaging as CTA');
}

// ─── ConversationList.tsx: first-run hint uses flag not length ────────────────
console.log('\n── components/messaging/ConversationList.tsx: first-run hint logic');
const convList = readOrFail('components/messaging/ConversationList.tsx');
if (convList) {
  check(convList, 'ConversationList.tsx',
    'earthos.messaging.firstNewConversationHintDismissed.v1',
    'First-run hint uses localStorage dismissed flag');
  checkAbsent(convList, 'ConversationList.tsx',
    'showNewHint && conversations.length === 0',
    'First-run hint NOT gated on conversations.length === 0');
  check(convList, 'ConversationList.tsx', 'showNewHint', 'showNewHint state present');
}

// ─── EmptyConversationJourney.tsx: no duplicate Invite CTA ───────────────────
console.log('\n── components/messaging/EmptyConversationJourney.tsx: no duplicate Invite');
const journey = readOrFail('components/messaging/EmptyConversationJourney.tsx');
if (journey) {
  // Primary invite button should still exist
  check(journey, 'EmptyConversationJourney.tsx',
    '!hasMembers',
    'Primary Invite button condition (!hasMembers) present');
  check(journey, 'EmptyConversationJourney.tsx',
    'onOpenMembers',
    'onOpenMembers handler present');

  // Step 1 JourneyStep should NOT pass cta when !hasMembers
  // The fix removes `cta={hasMembers ? undefined : t('conversation.inviteCta')}`
  // from Step 1 — the cta prop should not appear on Step 1 at all,
  // or should only appear when hasMembers (which would be undefined i.e. no CTA).
  // We verify the old duplicate pattern is gone.
  checkAbsent(journey, 'EmptyConversationJourney.tsx',
    "cta={hasMembers ? undefined : t('conversation.inviteCta')}",
    'Step 1 duplicate invite CTA removed');
}

// ─── PhoneQAPanel.tsx: updated wording ───────────────────────────────────────
console.log('\n── components/messaging/PhoneQAPanel.tsx: Pass 133 wording');
const panel = readOrFail('components/messaging/PhoneQAPanel.tsx');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'New button visible', '"New button visible" label present');
  checkAbsent(panel, 'PhoneQAPanel.tsx', "'New CTA visible'", 'Old "New CTA visible" wording removed');
  check(panel, 'PhoneQAPanel.tsx',
    'Empty journey shows single Invite button',
    '"Empty journey shows single Invite button" label present');
}

// ─── package.json: check-first-use-layout script registered ──────────────────
console.log('\n── package.json: check:first-use-layout script');
const pkg = readOrFail('package.json');
if (pkg) {
  check(pkg, 'package.json', 'check-first-use-layout', 'check:first-use-layout script registered');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[check-first-use-layout] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[check-first-use-layout] FAILED — First-use layout checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[check-first-use-layout] Passed with warnings.');
} else {
  console.log('[check-first-use-layout] All first-use layout checks passed.');
}
