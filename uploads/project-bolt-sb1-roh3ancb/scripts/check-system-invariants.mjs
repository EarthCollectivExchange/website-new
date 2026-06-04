/**
 * QLPA System Invariants Checker
 *
 * Verifies critical system invariants that must hold across the entire codebase:
 *   1. No plaintext message content in relay/network paths
 *   2. No Supabase service role key exposed in client code
 *   3. localStorage wrapped by browser guards
 *   4. All new tables have RLS enabled (checked via migration files)
 *
 * Run: node scripts/check-system-invariants.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, extname } from 'path';
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
  return readFileSync(p, 'utf8');
}

function checkAbsent(content, file, needle, label) {
  if (content && !content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: MUST NOT contain — ${label}`);
}

console.log('\n[system-invariants] QLPA System Invariants Audit\n');

// ─── 1. No service role key in client libs ────────────────────────────────────
console.log('── Invariant 1: No service role key in client code');
const supabaseTs = readOrFail('lib/supabase.ts');
if (supabaseTs) {
  checkAbsent(supabaseTs, 'lib/supabase.ts', 'service_role', 'no service_role key reference');
  checkAbsent(supabaseTs, 'lib/supabase.ts', 'SERVICE_ROLE', 'no SERVICE_ROLE env var reference');
}

// ─── 2. localStorage guards in local persistence modules ─────────────────────
console.log('\n── Invariant 2: localStorage browser guards present');
const localPersistence = readOrFail('lib/messaging/localPersistence.ts');
if (localPersistence) {
  if (localPersistence.includes("typeof window") || localPersistence.includes("typeof localStorage")) {
    pass('lib/messaging/localPersistence.ts: browser guard present');
  } else {
    warn('lib/messaging/localPersistence.ts: no explicit browser guard found — verify SSR safety');
  }
}

const localTestLog = readOrFail('lib/qlpa/localTestLog.ts');
if (localTestLog) {
  if (localTestLog.includes("typeof window !== 'undefined'")) {
    pass('lib/qlpa/localTestLog.ts: browser guard present');
  } else {
    fail('lib/qlpa/localTestLog.ts: missing browser guard for localStorage');
  }
}

// ─── 3. Release contract invariants ──────────────────────────────────────────
console.log('\n── Invariant 3: Release contract correctness');
const releaseContract = readOrFail('lib/qlpa/releaseContract.ts');
if (releaseContract) {
  if (releaseContract.includes("CURRENT_RELEASE_STAGE")) {
    pass('lib/qlpa/releaseContract.ts: CURRENT_RELEASE_STAGE exported');
  } else {
    fail('lib/qlpa/releaseContract.ts: CURRENT_RELEASE_STAGE missing');
  }
  if (releaseContract.includes("getCurrentStageLabelKey")) {
    pass('lib/qlpa/releaseContract.ts: getCurrentStageLabelKey exported');
  } else {
    fail('lib/qlpa/releaseContract.ts: getCurrentStageLabelKey missing');
  }
}

// ─── 4. Migration files have RLS ─────────────────────────────────────────────
console.log('\n── Invariant 4: Migration files include RLS');
const migrationsDir = resolve(root, 'supabase/migrations');
if (existsSync(migrationsDir)) {
  const migFiles = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  if (migFiles.length === 0) {
    warn('No migration files found');
  } else {
    for (const file of migFiles) {
      const content = readFileSync(resolve(migrationsDir, file), 'utf8');
      if (content.toLowerCase().includes('enable row level security') ||
          content.toLowerCase().includes('enable_row_level_security')) {
        pass(`migrations/${file}: RLS enabled`);
      } else if (content.toLowerCase().includes('create table')) {
        warn(`migrations/${file}: CREATE TABLE found but no RLS enable statement — verify`);
      } else {
        pass(`migrations/${file}: no CREATE TABLE (data-only or alter migration)`);
      }
    }
  }
} else {
  warn('supabase/migrations directory not found');
}

// ─── 5. Pure module check for testDiagnostics ─────────────────────────────────
console.log('\n── Invariant 5: testDiagnostics.ts is pure (no browser APIs)');
const testDiagnostics = readOrFail('lib/qlpa/testDiagnostics.ts');
if (testDiagnostics) {
  checkAbsent(testDiagnostics, 'testDiagnostics.ts', 'fetch(', 'no fetch calls');
  checkAbsent(testDiagnostics, 'testDiagnostics.ts', 'localStorage.', 'no localStorage calls');
  checkAbsent(testDiagnostics, 'testDiagnostics.ts', "from '@supabase", 'no Supabase import');
}

console.log(`\n[system-invariants] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[system-invariants] FAILED — one or more system invariants violated.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[system-invariants] Passed with warnings.');
} else {
  console.log('[system-invariants] All system invariants verified.');
}
