/**
 * QLPA Phone QA Panel Checker — Pass 132
 *
 * Verifies PhoneQAPanel satisfies Pass 131 + Pass 132 constraints:
 * Developer-only gating, local-only storage, no network calls,
 * grouped sections, next-untested helper, focus display,
 * device presets, improved grouped report, total counts,
 * 3-state checklist, metadata fields, issue notes,
 * export/copy with fallback, dual reset.
 *
 * Run: node scripts/check-phone-qa-panel.mjs
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

console.log('\n[check-phone-qa-panel] Pass 132 Phone QA Panel Audit\n');

// ─── PhoneQAPanel.tsx: structure and safety ───────────────────────────────────
console.log('── PhoneQAPanel.tsx: structure and safety');
const panel = readOrFail('components/messaging/PhoneQAPanel.tsx');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'earthos.phoneQa.v1',      'localStorage key earthos.phoneQa.v1 present');
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-panel', 'data-qlpa-phone-qa-panel attribute present');
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-reset', 'data-qlpa-phone-qa-reset attribute on reset button');
  check(panel, 'PhoneQAPanel.tsx', "typeof window === 'undefined'", 'localStorage SSR guard present');

  // No network calls
  console.log('\n── PhoneQAPanel.tsx: no network / database calls');
  checkAbsent(panel, 'PhoneQAPanel.tsx', 'fetch(',          'No fetch() calls');
  checkAbsent(panel, 'PhoneQAPanel.tsx', 'supabase',        'No supabase calls');
  checkAbsent(panel, 'PhoneQAPanel.tsx', 'XMLHttpRequest',  'No XMLHttpRequest');
}

// ─── Pass 131: 3-state checklist ─────────────────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: 3-state checklist');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', "'untested'",  "Status: 'untested' present");
  check(panel, 'PhoneQAPanel.tsx', "'pass'",      "Status: 'pass' present");
  check(panel, 'PhoneQAPanel.tsx', "'issue'",     "Status: 'issue' present");
  check(panel, 'PhoneQAPanel.tsx', 'cycleStatus', 'cycleStatus function present');
  check(panel, 'PhoneQAPanel.tsx', 'freshChecks', 'freshChecks helper present');
}

// ─── Pass 131: metadata + export + dual reset ─────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: metadata, export, dual reset');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'deviceLabel',             'deviceLabel field present');
  check(panel, 'PhoneQAPanel.tsx', 'testRound',               'testRound field present');
  check(panel, 'PhoneQAPanel.tsx', 'testerNote',              'testerNote field present');
  check(panel, 'PhoneQAPanel.tsx', 'lastUpdated',             'lastUpdated timestamp present');
  check(panel, 'PhoneQAPanel.tsx', 'generateReport',          'generateReport function present');
  check(panel, 'PhoneQAPanel.tsx', 'Copy QA report',          '"Copy QA report" button label present');
  check(panel, 'PhoneQAPanel.tsx', 'navigator.clipboard',     'navigator.clipboard used');
  check(panel, 'PhoneQAPanel.tsx', 'writeText',               'clipboard.writeText called');
  check(panel, 'PhoneQAPanel.tsx', 'Clipboard unavailable',   'Clipboard fallback message present');
  check(panel, 'PhoneQAPanel.tsx', 'fallbackRef',             'Fallback textarea ref present');
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-copy', 'data-qlpa-phone-qa-copy attribute present');
  check(panel, 'PhoneQAPanel.tsx', 'Reset checklist statuses','Reset statuses button label present');
  check(panel, 'PhoneQAPanel.tsx', 'Reset all Phone QA data', 'Reset all button label present');
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-reset-all', 'data-qlpa-phone-qa-reset-all present');
}

// ─── Pass 132: grouped sections ───────────────────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: Pass 132 — grouped sections');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-sections', 'sections container attribute present');
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-section',           'data-qlpa-section per section present');

  const REQUIRED_SECTIONS = [
    'Launch & Landing',
    'Conversation List',
    'Create Conversation',
    'Empty Conversation Journey',
    'Message Composer',
    'Status Pills',
    'Mobile Sheets',
    'Settings',
    'Release Marker',
    'Export / Reset',
  ];
  console.log('\n── PhoneQAPanel.tsx: Pass 132 — all 10 section names');
  for (const name of REQUIRED_SECTIONS) {
    check(panel, 'PhoneQAPanel.tsx', name, `Section: "${name}"`);
  }
}

// ─── Pass 132: next-untested helper ──────────────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: Pass 132 — next untested helper');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-next',    'data-qlpa-phone-qa-next attribute present');
  check(panel, 'PhoneQAPanel.tsx', 'Next untested',              '"Next untested" button label present');
  check(panel, 'PhoneQAPanel.tsx', 'All items have been reviewed.', 'all-reviewed message present');
  check(panel, 'PhoneQAPanel.tsx', 'goNextUntested',             'goNextUntested handler present');
}

// ─── Pass 132: focus display ──────────────────────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: Pass 132 — focus display');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-focus',       'data-qlpa-phone-qa-focus attribute present');
  check(panel, 'PhoneQAPanel.tsx', 'All current phone checks pass locally.', 'all-pass focus line present');
  check(panel, 'PhoneQAPanel.tsx', 'Issues open:',                   'issues-open focus line present');
  check(panel, 'PhoneQAPanel.tsx', 'focusLine',                      'focusLine computed variable present');
}

// ─── Pass 132: grouped report with total counts ───────────────────────────────
console.log('\n── PhoneQAPanel.tsx: Pass 132 — grouped report + total counts');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'for (const section of SECTIONS)',  'report loops over SECTIONS');
  check(panel, 'PhoneQAPanel.tsx', 'totalPass',    'totalPass count present');
  check(panel, 'PhoneQAPanel.tsx', 'totalIssue',   'totalIssue count present');
  check(panel, 'PhoneQAPanel.tsx', 'totalUntested','totalUntested count present');
  check(panel, 'PhoneQAPanel.tsx', 'Pass: ${totalPass}', 'Pass count in report');
  check(panel, 'PhoneQAPanel.tsx', 'Issue: ${totalIssue}', 'Issue count in report');
  check(panel, 'PhoneQAPanel.tsx', 'Untested: ${totalUntested}', 'Untested count in report');
}

// ─── Pass 132: device presets ─────────────────────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: Pass 132 — device presets');
if (panel) {
  check(panel, 'PhoneQAPanel.tsx', 'data-qlpa-phone-qa-presets', 'data-qlpa-phone-qa-presets attribute present');
  check(panel, 'PhoneQAPanel.tsx', 'DEVICE_PRESETS',              'DEVICE_PRESETS array present');
  check(panel, 'PhoneQAPanel.tsx', 'iPhone Safari',               'Preset: iPhone Safari');
  check(panel, 'PhoneQAPanel.tsx', 'iPhone Brave',                'Preset: iPhone Brave');
  check(panel, 'PhoneQAPanel.tsx', 'Samsung Brave',               'Preset: Samsung Brave');
  check(panel, 'PhoneQAPanel.tsx', 'Desktop Preview',             'Preset: Desktop Preview');
  check(panel, 'PhoneQAPanel.tsx', 'applyPreset',                 'applyPreset handler present');
}

// ─── Required checklist item keywords ────────────────────────────────────────
console.log('\n── PhoneQAPanel.tsx: required checklist item keywords');
if (panel) {
  const REQUIRED_ITEMS = [
    'Landing opens cleanly',
    'Conversation list scrolls',
    'New button visible',
    'Invite member works',
    'Send test message works',
    'Protected sheet opens',
    'Ready sheet opens',
    'Allowed sheet opens',
    'Sheet scrolls internally',
    'Background stays still',
    'Close',
    'Mode panel scrolls',
    'Message journey opens',
    'No raw i18n keys visible',
  ];
  for (const item of REQUIRED_ITEMS) {
    check(panel, 'PhoneQAPanel.tsx', item, `Checklist item: "${item}"`);
  }
}

// ─── SettingsTab.tsx: wiring ──────────────────────────────────────────────────
console.log('\n── SettingsTab.tsx: PhoneQAPanel import and Developer-only gate');
const settings = readOrFail('components/messaging/SettingsTab.tsx');
if (settings) {
  check(settings, 'SettingsTab.tsx', "from './PhoneQAPanel'", 'PhoneQAPanel imported');
  check(settings, 'SettingsTab.tsx', '<PhoneQAPanel',        'PhoneQAPanel rendered');
  check(settings, 'SettingsTab.tsx', 'interfaceMode',        'interfaceMode prop passed');

  const devBlockIdx = settings.indexOf('isDeveloper(viewLevel)');
  const phoneQaIdx  = settings.indexOf('<PhoneQAPanel');
  if (devBlockIdx !== -1 && phoneQaIdx !== -1 && phoneQaIdx > devBlockIdx) {
    pass('SettingsTab.tsx: PhoneQAPanel appears after isDeveloper(viewLevel) gate');
  } else {
    fail('SettingsTab.tsx: PhoneQAPanel is not inside the isDeveloper(viewLevel) block');
  }
}

// ─── i18n: phoneQa section in all 7 locales ───────────────────────────────────
console.log('\n── i18n locales: phoneQa section in all 7 locales');
const LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'id'];
for (const lang of LOCALES) {
  const p = resolve(root, `lib/i18n/locales/${lang}.json`);
  if (!existsSync(p)) { fail(`Locale file missing: ${lang}.json`); continue; }
  const content = readFileSync(p, 'utf8');
  if (content.includes('"phoneQa"')) {
    pass(`${lang}.json: phoneQa section present`);
  } else {
    fail(`${lang}.json: phoneQa section MISSING`);
  }
  // Pass 131 keys
  if (content.includes('"copyReport"'))     pass(`${lang}.json: phoneQa.copyReport present`);
  else                                      fail(`${lang}.json: phoneQa.copyReport MISSING`);
  if (content.includes('"resetAll"'))       pass(`${lang}.json: phoneQa.resetAll present`);
  else                                      fail(`${lang}.json: phoneQa.resetAll MISSING`);
  // Pass 132 keys
  if (content.includes('"nextUntested"'))   pass(`${lang}.json: phoneQa.nextUntested present`);
  else                                      fail(`${lang}.json: phoneQa.nextUntested MISSING`);
  if (content.includes('"sectionLaunch"'))  pass(`${lang}.json: phoneQa.sectionLaunch present`);
  else                                      fail(`${lang}.json: phoneQa.sectionLaunch MISSING`);
  if (content.includes('"focusAllPass"'))   pass(`${lang}.json: phoneQa.focusAllPass present`);
  else                                      fail(`${lang}.json: phoneQa.focusAllPass MISSING`);
  if (content.includes('"presetIphoneSafari"')) pass(`${lang}.json: phoneQa.presetIphoneSafari present`);
  else                                          fail(`${lang}.json: phoneQa.presetIphoneSafari MISSING`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[check-phone-qa-panel] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[check-phone-qa-panel] FAILED — Phone QA panel checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[check-phone-qa-panel] Passed with warnings.');
} else {
  console.log('[check-phone-qa-panel] All Phone QA panel checks passed.');
}
