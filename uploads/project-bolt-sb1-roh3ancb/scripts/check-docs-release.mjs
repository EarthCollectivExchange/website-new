/**
 * QLPA Docs Release Checker
 *
 * Verifies that the key documentation files are present, contain
 * required disclosure language, and are consistent with the release contract.
 *
 * Run: node scripts/check-docs-release.mjs
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

function readOrWarn(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) { warn(`Not found (optional): ${rel}`); return null; }
  pass(`Exists: ${rel}`);
  return readFileSync(p, 'utf8');
}

function check(content, file, needle, label) {
  if (content && content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: MISSING — ${label}`);
}

console.log('\n[docs-release] QLPA Docs Release Audit\n');

// ─── Core docs ────────────────────────────────────────────────────────────────
console.log('── Core documentation');
const preMvpStatus   = readOrFail('docs/PRE_MVP_STATUS.md');
const archMap        = readOrFail('docs/QLPA_ARCHITECTURE_MAP.md');
const testDiagDoc    = readOrWarn('docs/QLPA_INTERNAL_TEST_DIAGNOSTICS.md');

// ─── PRE_MVP_STATUS.md ────────────────────────────────────────────────────────
if (preMvpStatus) {
  console.log('\n── PRE_MVP_STATUS.md checks');
  check(preMvpStatus, 'PRE_MVP_STATUS.md', 'Pre-MVP', 'contains Pre-MVP label');
  check(preMvpStatus, 'PRE_MVP_STATUS.md', 'Pass', 'contains pass reference');

  if (preMvpStatus.toLowerCase().includes('controlled test') ||
      preMvpStatus.toLowerCase().includes('controlled-test')) {
    pass('PRE_MVP_STATUS.md: references controlled test phase');
  } else {
    warn('PRE_MVP_STATUS.md: controlled test phase reference not found');
  }
}

// ─── QLPA_ARCHITECTURE_MAP.md ──────────────────────────────────────────────────
if (archMap) {
  console.log('\n── QLPA_ARCHITECTURE_MAP.md checks');
  check(archMap, 'QLPA_ARCHITECTURE_MAP.md', 'QLPA', 'contains QLPA reference');
  check(archMap, 'QLPA_ARCHITECTURE_MAP.md', 'Pass', 'contains pass history');
}

// ─── QLPA_INTERNAL_TEST_DIAGNOSTICS.md (optional but recommended) ────────────
if (testDiagDoc) {
  console.log('\n── QLPA_INTERNAL_TEST_DIAGNOSTICS.md checks');
  check(testDiagDoc, 'QLPA_INTERNAL_TEST_DIAGNOSTICS.md', 'testDiagnostics', 'references testDiagnostics module');
  check(testDiagDoc, 'QLPA_INTERNAL_TEST_DIAGNOSTICS.md', 'localTestLog', 'references localTestLog module');
  check(testDiagDoc, 'QLPA_INTERNAL_TEST_DIAGNOSTICS.md', 'Developer', 'references Developer mode gate');
}

// ─── Release contract doc consistency ────────────────────────────────────────
console.log('\n── Release contract consistency');
const releaseContract = readOrFail('lib/qlpa/releaseContract.ts');
if (releaseContract && preMvpStatus) {
  if (releaseContract.includes("'pre-mvp'") &&
      (preMvpStatus.includes('Pre-MVP') || preMvpStatus.includes('pre-mvp'))) {
    pass('Release contract and PRE_MVP_STATUS.md agree on Pre-MVP stage');
  } else {
    warn('Release contract stage and PRE_MVP_STATUS.md may be inconsistent — verify');
  }
}

// ─── QLPA_TODO.md or equivalent ──────────────────────────────────────────────
console.log('\n── Optional docs');
const qlpaTodo = readOrWarn('docs/QLPA_TODO.md');
if (qlpaTodo) {
  pass('docs/QLPA_TODO.md: present');
}

console.log(`\n[docs-release] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[docs-release] FAILED — documentation incomplete or inconsistent.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[docs-release] Passed with warnings.');
} else {
  console.log('[docs-release] All documentation checks passed.');
}
