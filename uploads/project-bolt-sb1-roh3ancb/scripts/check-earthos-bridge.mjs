/**
 * QLPA EarthOS Bridge Checker
 *
 * Verifies that the EarthOS auth bridge module meets the required
 * interface and safety constraints.
 *
 * Run: node scripts/check-earthos-bridge.mjs
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

function checkAbsent(content, file, needle, label) {
  if (content && !content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: MUST NOT contain — ${label}`);
}

console.log('\n[earthos-bridge] EarthOS Bridge Audit\n');

// ─── authBridge.ts ─────────────────────────────────────────────────────────────
console.log('── lib/messaging/authBridge.ts');
const bridge = readOrWarn('lib/messaging/authBridge.ts');

if (bridge) {
  if (bridge.includes('AuthBridgeResult') || bridge.includes('EarthOSBridgeState')) {
    pass('authBridge.ts: exports bridge state type');
  } else {
    warn('authBridge.ts: bridge state type not found — verify exports');
  }
  if (bridge.includes('export') && (bridge.includes('function ') || bridge.includes('const '))) {
    pass('authBridge.ts: exports at least one function or const');
  } else {
    warn('authBridge.ts: no exported function found — verify');
  }
  checkAbsent(bridge, 'authBridge.ts', 'console.log(', 'no debug console.log calls');
}

// ─── Supabase auth usage ───────────────────────────────────────────────────────
console.log('\n── Supabase auth safety');
const supabase = readOrWarn('lib/supabase.ts');
if (supabase) {
  checkAbsent(supabase, 'supabase.ts', 'service_role', 'no service role key in client lib');
}

// ─── i18n earthIdSignIn keys ──────────────────────────────────────────────────
console.log('\n── i18n earthIdSignIn section (en)');
const enJson = readOrWarn('lib/i18n/locales/en.json');
if (enJson) {
  if (enJson.includes('"earthIdSignIn"')) pass('en.json: earthIdSignIn section present');
  else warn('en.json: earthIdSignIn section not found — may be optional');
}

console.log(`\n[earthos-bridge] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[earthos-bridge] FAILED.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[earthos-bridge] Passed with warnings.');
} else {
  console.log('[earthos-bridge] All bridge checks passed.');
}
