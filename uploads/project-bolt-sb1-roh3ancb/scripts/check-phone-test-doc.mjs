/**
 * QLPA Phone Test Doc Checker — Pass 129
 *
 * Verifies that docs/QLPA_PHONE_TEST_PASS_129.md exists and contains
 * all required device sections and core checklist items.
 *
 * Assertions:
 *   1. QLPA_PHONE_TEST_PASS_129.md exists
 *   2. All 4 required device sections present
 *   3. All required checklist item keywords present
 *   4. Sign-off table present
 *   5. Known limitations section present
 *
 * Run: node scripts/check-phone-test-doc.mjs
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

function check(content, needle, label) {
  if (content && content.includes(needle)) pass(label);
  else fail(`MISSING — ${label}`);
}

console.log('\n[check-phone-test-doc] Pass 129 Phone Test Doc Audit\n');

// ─── File exists ──────────────────────────────────────────────────────────────
console.log('── File existence');
const docPath = resolve(root, 'docs/QLPA_PHONE_TEST_PASS_129.md');
if (!existsSync(docPath)) {
  fail('docs/QLPA_PHONE_TEST_PASS_129.md MISSING');
  console.error(`\n[check-phone-test-doc] Complete. Errors: ${errors}, Warnings: ${warnings}`);
  console.error('[check-phone-test-doc] FAILED — phone test doc not found.');
  process.exit(1);
}
pass('docs/QLPA_PHONE_TEST_PASS_129.md exists');
const doc = readFileSync(docPath, 'utf8');

// ─── Device sections ──────────────────────────────────────────────────────────
console.log('\n── Device sections');
check(doc, 'iPhone Safari',  'Device section: iPhone Safari');
check(doc, 'iPhone Brave',   'Device section: iPhone Brave');
check(doc, 'Samsung Brave',  'Device section: Samsung Brave');
check(doc, 'Samsung Chrome', 'Device section: Samsung Chrome');

// ─── Required checklist items ─────────────────────────────────────────────────
console.log('\n── Required checklist items');
check(doc, 'Landing page opens cleanly',             'Checklist: landing opens cleanly');
check(doc, 'Conversation list scrolls',              'Checklist: conversation list scrolls');
check(doc, 'New conversation',                       'Checklist: new conversation CTA');
check(doc, 'Invite member',                          'Checklist: invite member primary CTA');
check(doc, 'Send test message',                      'Checklist: send test message');
check(doc, 'Disabled',                               'Checklist: disabled state');
check(doc, 'Sheet',                                  'Checklist: sheets present');
check(doc, '82% viewport height',                    'Checklist: 82% height noted');
check(doc, 'Drag handle tap closes',                 'Checklist: drag handle tap-to-close');
check(doc, 'Backdrop tap closes',                    'Checklist: backdrop tap closes');
check(doc, 'scrolls its content internally',         'Checklist: sheets scroll internally');
check(doc, 'does NOT scroll while a sheet is open',  'Checklist: body locked while sheet open');
check(doc, 'not blurred or dimmed',                  'Checklist: no blur on sheet content');
check(doc, 'Mode',                                   'Checklist: mode panel mentioned');
check(doc, 'Message Journey',                        'Checklist: message journey');
check(doc, 'Settings page scrolls',                  'Checklist: settings scrolls');
check(doc, 'raw i18n keys',                          'Checklist: no raw i18n keys');
check(doc, 'duplicate',                              'Checklist: no duplicate conversations');

// ─── Sign-off table ───────────────────────────────────────────────────────────
console.log('\n── Sign-off table');
check(doc, 'Sign-off', 'Sign-off section present');
check(doc, 'Tester',   'Tester column present');
check(doc, 'Result',   'Result column present');

// ─── Known limitations ────────────────────────────────────────────────────────
console.log('\n── Known limitations');
check(doc, 'Known limitations', 'Known limitations section present');
check(doc, 'local-only',        'Local-only relay note present');

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[check-phone-test-doc] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[check-phone-test-doc] FAILED — phone test doc is incomplete.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[check-phone-test-doc] Passed with warnings.');
} else {
  console.log('[check-phone-test-doc] All phone test doc checks passed.');
}
