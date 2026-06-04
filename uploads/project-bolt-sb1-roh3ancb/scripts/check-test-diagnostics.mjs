/**
 * QLPA Internal Test Diagnostics Checker — Pass 123
 *
 * Verifies that the internal test diagnostics module and local test log
 * meet the local-only, pure-module requirements.
 *
 * Run: node scripts/check-test-diagnostics.mjs
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

console.log('\n[test-diagnostics] QLPA Internal Test Diagnostics Audit — Pass 123\n');

// ─── Module files ──────────────────────────────────────────────────────────────
console.log('── Module files');

const diagnostics  = readOrFail('lib/qlpa/testDiagnostics.ts');
const localTestLog = readOrFail('lib/qlpa/localTestLog.ts');
const qlpaIndex    = readOrFail('lib/qlpa/index.ts');

// ─── testDiagnostics.ts exports and types ────────────────────────────────────
if (diagnostics) {
  console.log('\n── testDiagnostics.ts — types');
  check(diagnostics, 'testDiagnostics.ts', 'TestDeviceType', 'exports TestDeviceType');
  check(diagnostics, 'testDiagnostics.ts', 'TestBrowser', 'exports TestBrowser');
  check(diagnostics, 'testDiagnostics.ts', 'TestSurface', 'exports TestSurface');
  check(diagnostics, 'testDiagnostics.ts', 'TestIssueCategory', 'exports TestIssueCategory');
  check(diagnostics, 'testDiagnostics.ts', 'TestSeverity', 'exports TestSeverity');
  check(diagnostics, 'testDiagnostics.ts', 'TestDiagnosticRecord', 'exports TestDiagnosticRecord');

  console.log('\n── testDiagnostics.ts — device types');
  check(diagnostics, 'testDiagnostics.ts', "'iphone'", 'device type: iphone');
  check(diagnostics, 'testDiagnostics.ts', "'android'", 'device type: android');
  check(diagnostics, 'testDiagnostics.ts', "'desktop'", 'device type: desktop');
  check(diagnostics, 'testDiagnostics.ts', "'tablet'", 'device type: tablet');
  check(diagnostics, 'testDiagnostics.ts', "'unknown'", 'device type: unknown');

  console.log('\n── testDiagnostics.ts — browser types');
  check(diagnostics, 'testDiagnostics.ts', "'safari'", 'browser: safari');
  check(diagnostics, 'testDiagnostics.ts', "'brave'", 'browser: brave');
  check(diagnostics, 'testDiagnostics.ts', "'chrome'", 'browser: chrome');
  check(diagnostics, 'testDiagnostics.ts', "'firefox'", 'browser: firefox');
  check(diagnostics, 'testDiagnostics.ts', "'edge'", 'browser: edge');

  console.log('\n── testDiagnostics.ts — surfaces');
  check(diagnostics, 'testDiagnostics.ts', "'landing'", 'surface: landing');
  check(diagnostics, 'testDiagnostics.ts', "'messages-list'", 'surface: messages-list');
  check(diagnostics, 'testDiagnostics.ts', "'conversation-view'", 'surface: conversation-view');
  check(diagnostics, 'testDiagnostics.ts', "'settings'", 'surface: settings');
  check(diagnostics, 'testDiagnostics.ts', "'composer'", 'surface: composer');
  check(diagnostics, 'testDiagnostics.ts', "'bottom-nav'", 'surface: bottom-nav');

  console.log('\n── testDiagnostics.ts — issue categories');
  check(diagnostics, 'testDiagnostics.ts', "'scroll'", 'category: scroll');
  check(diagnostics, 'testDiagnostics.ts', "'layout'", 'category: layout');
  check(diagnostics, 'testDiagnostics.ts', "'i18n'", 'category: i18n');
  check(diagnostics, 'testDiagnostics.ts', "'touch'", 'category: touch');
  check(diagnostics, 'testDiagnostics.ts', "'overlay'", 'category: overlay');
  check(diagnostics, 'testDiagnostics.ts', "'safety'", 'category: safety');

  console.log('\n── testDiagnostics.ts — severity levels');
  check(diagnostics, 'testDiagnostics.ts', "'note'", 'severity: note');
  check(diagnostics, 'testDiagnostics.ts', "'minor'", 'severity: minor');
  check(diagnostics, 'testDiagnostics.ts', "'major'", 'severity: major');
  check(diagnostics, 'testDiagnostics.ts', "'blocker'", 'severity: blocker');

  console.log('\n── testDiagnostics.ts — helpers');
  check(diagnostics, 'testDiagnostics.ts', 'createDiagnosticRecord', 'exports createDiagnosticRecord');
  check(diagnostics, 'testDiagnostics.ts', 'classifyIssueSeverity', 'exports classifyIssueSeverity');
  check(diagnostics, 'testDiagnostics.ts', 'getDeviceRuntimeSummary', 'exports getDeviceRuntimeSummary');
  check(diagnostics, 'testDiagnostics.ts', 'formatDiagnosticForCopy', 'exports formatDiagnosticForCopy');

  console.log('\n── testDiagnostics.ts — purity checks');
  checkAbsent(diagnostics, 'testDiagnostics.ts', 'fetch(', 'no fetch calls');
  checkAbsent(diagnostics, 'testDiagnostics.ts', 'XMLHttpRequest', 'no XMLHttpRequest');
  checkAbsent(diagnostics, 'testDiagnostics.ts', "from '@supabase", 'no Supabase import');
  checkAbsent(diagnostics, 'testDiagnostics.ts', 'localStorage.', 'no localStorage calls (pure module)');
  check(diagnostics, 'testDiagnostics.ts', 'No network calls', 'no-network comment present');

  console.log('\n── testDiagnostics.ts — record structure');
  check(diagnostics, 'testDiagnostics.ts', 'createdAt', 'record has createdAt');
  check(diagnostics, 'testDiagnostics.ts', 'deviceType', 'record has deviceType');
  check(diagnostics, 'testDiagnostics.ts', 'issueCategory', 'record has issueCategory');
  check(diagnostics, 'testDiagnostics.ts', 'severity', 'record has severity');
  check(diagnostics, 'testDiagnostics.ts', 'description', 'record has description');
  check(diagnostics, 'testDiagnostics.ts', 'screenshotNote?', 'record has optional screenshotNote');

  console.log('\n── testDiagnostics.ts — formatter');
  check(diagnostics, 'testDiagnostics.ts', 'formatDiagnosticForCopy', 'formatter present');
  check(diagnostics, 'testDiagnostics.ts', "lines.join('\\n')", 'formatter returns readable text');
}

// ─── localTestLog.ts ─────────────────────────────────────────────────────────
if (localTestLog) {
  console.log('\n── localTestLog.ts — storage key');
  check(localTestLog, 'localTestLog.ts', 'earthos.testDiagnostics.v1', 'correct storage key');
  check(localTestLog, 'localTestLog.ts', 'LOCAL_TEST_LOG_KEY', 'exported storage key constant');

  console.log('\n── localTestLog.ts — browser API guard');
  check(localTestLog, 'localTestLog.ts', "typeof window !== 'undefined'", 'browser API guard present');
  check(localTestLog, 'localTestLog.ts', 'isAvailable()', 'isAvailable guard used');

  console.log('\n── localTestLog.ts — helpers');
  check(localTestLog, 'localTestLog.ts', 'saveDiagnosticRecord', 'exports saveDiagnosticRecord');
  check(localTestLog, 'localTestLog.ts', 'listDiagnosticRecords', 'exports listDiagnosticRecords');
  check(localTestLog, 'localTestLog.ts', 'clearDiagnosticRecords', 'exports clearDiagnosticRecords');
  check(localTestLog, 'localTestLog.ts', 'exportDiagnosticRecords', 'exports exportDiagnosticRecords');

  console.log('\n── localTestLog.ts — purity checks');
  checkAbsent(localTestLog, 'localTestLog.ts', 'fetch(', 'no fetch calls');
  checkAbsent(localTestLog, 'localTestLog.ts', 'XMLHttpRequest', 'no XMLHttpRequest');
  checkAbsent(localTestLog, 'localTestLog.ts', "from '@supabase", 'no Supabase import');

  console.log('\n── localTestLog.ts — safe failure');
  check(localTestLog, 'localTestLog.ts', 'catch', 'safe catch blocks present');
  check(localTestLog, 'localTestLog.ts', 'return [];', 'empty fallback on failure');

  console.log('\n── localTestLog.ts — localStorage operations');
  check(localTestLog, 'localTestLog.ts', 'localStorage.getItem', 'reads from localStorage');
  check(localTestLog, 'localTestLog.ts', 'localStorage.setItem', 'writes to localStorage');
  check(localTestLog, 'localTestLog.ts', 'localStorage.removeItem', 'clears from localStorage');
}

// ─── index.ts re-exports ──────────────────────────────────────────────────────
if (qlpaIndex) {
  console.log('\n── index.ts re-exports');
  check(qlpaIndex, 'index.ts', './testDiagnostics', 're-exports testDiagnostics');
  check(qlpaIndex, 'index.ts', './localTestLog', 're-exports localTestLog');
}

// ─── i18n diagnostics keys ────────────────────────────────────────────────────
console.log('\n── i18n diagnostics keys (en)');
const enJson = readOrFail('lib/i18n/locales/en.json');
if (enJson) {
  const requiredKeys = [
    'diagnostics.title',
    'diagnostics.localOnly',
    'diagnostics.deviceSummary',
    'diagnostics.records',
    'diagnostics.copySummary',
    'diagnostics.clearLog',
    'diagnostics.createNote',
    'diagnostics.noteCreated',
    'diagnostics.logCleared',
    'diagnostics.hiddenInSimple',
  ];
  for (const key of requiredKeys) {
    const jsonKey = `"${key.split('.')[1]}"`;
    if (enJson.includes('"diagnostics"') && enJson.includes(jsonKey)) {
      pass(`en.json: key: ${key}`);
    } else {
      fail(`en.json: MISSING key: ${key}`);
    }
  }
}

console.log('\n── diagnostics section in all locales');
const locales = ['en', 'de', 'es', 'fr', 'id', 'it', 'pt'];
for (const locale of locales) {
  const content = readOrFail(`lib/i18n/locales/${locale}.json`);
  if (content) {
    if (content.includes('"diagnostics"')) pass(`${locale}.json: diagnostics section present`);
    else fail(`${locale}.json: diagnostics section MISSING`);
    if (content.includes('"release"')) pass(`${locale}.json: release section present`);
    else fail(`${locale}.json: release section MISSING`);
  }
}

// ─── SettingsTab usage ────────────────────────────────────────────────────────
console.log('\n── SettingsTab.tsx diagnostics integration');
const settingsTab = resolve(root, 'components/messaging/SettingsTab.tsx');
if (existsSync(settingsTab)) {
  const content = readFileSync(settingsTab, 'utf8');
  if (content.includes('testDiagnostics') || content.includes('createDiagnosticRecord'))
    pass('SettingsTab.tsx: imports testDiagnostics');
  else fail('SettingsTab.tsx: missing testDiagnostics import');

  if (content.includes('localTestLog') || content.includes('saveDiagnosticRecord'))
    pass('SettingsTab.tsx: imports localTestLog');
  else fail('SettingsTab.tsx: missing localTestLog import');

  if (content.includes("t('diagnostics.title')"))
    pass('SettingsTab.tsx: renders diagnostics.title via t()');
  else fail('SettingsTab.tsx: missing diagnostics.title render');

  if (content.includes("t('diagnostics.clearLog')"))
    pass('SettingsTab.tsx: renders clearLog via t()');
  else fail('SettingsTab.tsx: missing clearLog render');

  if (content.includes('isDeveloper(viewLevel)') && content.includes('diagnostics'))
    pass('SettingsTab.tsx: diagnostics panel gated behind isDeveloper');
  else warn('SettingsTab.tsx: developer gate check inconclusive — verify manually');
} else {
  warn('SettingsTab.tsx not found');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[test-diagnostics] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[test-diagnostics] FAILED — diagnostics module incomplete or insecure.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[test-diagnostics] Passed with warnings.');
} else {
  console.log('[test-diagnostics] All diagnostics checks passed.');
}
