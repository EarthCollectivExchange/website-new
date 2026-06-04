/**
 * QLPA EarthCoin Governance Boundary Checker
 *
 * Verifies that EarthCoin / token reward references in the codebase
 * are clearly marked as inactive and do not make false capability claims.
 *
 * Run: node scripts/check-earthcoin-governance.mjs
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

console.log('\n[earthcoin-governance] EarthCoin Governance Boundary Audit\n');

// ─── Release contract declares earthCoin as inactive ─────────────────────────
console.log('── Release contract capability status');
const releaseContract = readOrFail('lib/qlpa/releaseContract.ts');
if (releaseContract) {
  check(releaseContract, 'releaseContract.ts', "'earthCoin'", 'earthCoin capability defined');
  check(releaseContract, 'releaseContract.ts', "'inactive'", 'inactive status present');

  const earthCoinIdx = releaseContract.indexOf("'earthCoin'");
  const inactiveNear = releaseContract.slice(
    Math.max(0, earthCoinIdx - 10),
    Math.min(releaseContract.length, earthCoinIdx + 200)
  );
  if (inactiveNear.includes("'inactive'")) {
    pass('releaseContract.ts: earthCoin status is inactive');
  } else {
    fail('releaseContract.ts: earthCoin capability must have status inactive');
  }
}

// ─── i18n inactive key present ────────────────────────────────────────────────
console.log('\n── i18n release.inactive key (en)');
const enJson = readOrFail('lib/i18n/locales/en.json');
if (enJson) {
  if (enJson.includes('"release"') && enJson.includes('"inactive"')) {
    pass('en.json: release.inactive key present');
  } else {
    fail('en.json: release.inactive key missing');
  }
}

// ─── No false production claims for token rewards ────────────────────────────
console.log('\n── No false production claims');
const releaseContent = releaseContract || '';
if (releaseContent) {
  const tokenIdx = releaseContent.indexOf("'tokenRewards'");
  const nearToken = releaseContent.slice(
    Math.max(0, tokenIdx - 10),
    Math.min(releaseContent.length, tokenIdx + 200)
  );
  if (!nearToken.includes("'active'")) {
    pass('releaseContract.ts: tokenRewards is not marked as active');
  } else {
    fail('releaseContract.ts: tokenRewards must NOT be marked as active in pre-MVP');
  }
}

console.log(`\n[earthcoin-governance] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[earthcoin-governance] FAILED.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[earthcoin-governance] Passed with warnings.');
} else {
  console.log('[earthcoin-governance] All governance boundary checks passed.');
}
