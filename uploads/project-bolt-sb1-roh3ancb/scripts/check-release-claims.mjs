/**
 * QLPA Release Claims Checker
 *
 * Verifies that the codebase makes only truthful, accurate release claims.
 * Checks that no active capability is falsely claimed, and that all
 * inactive capabilities are clearly labelled.
 *
 * Run: node scripts/check-release-claims.mjs
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

console.log('\n[release-claims] QLPA Release Claims Audit\n');

// ─── Release contract has truthful stage ─────────────────────────────────────
console.log('── Release contract stage');
const releaseContract = readOrFail('lib/qlpa/releaseContract.ts');
if (releaseContract) {
  check(releaseContract, 'releaseContract.ts', 'CURRENT_RELEASE_STAGE', 'exports CURRENT_RELEASE_STAGE');
  check(releaseContract, 'releaseContract.ts', "'pre-mvp'", 'stage is pre-mvp (truthful)');
  if (releaseContract.includes("CURRENT_RELEASE_STAGE = 'production'") ||
      releaseContract.includes('CURRENT_RELEASE_STAGE = "production"')) {
    fail('releaseContract.ts: CURRENT_RELEASE_STAGE must NOT be set to production in pre-MVP');
  } else {
    pass('releaseContract.ts: does not falsely claim production stage');
  }
}

// ─── en.json release keys ────────────────────────────────────────────────────
console.log('\n── i18n release keys (en)');
const enJson = readOrFail('lib/i18n/locales/en.json');
if (enJson) {
  const requiredKeys = [
    'controlledTestBadge',
    'useDemoDataOnly',
    'capabilityLocalMessaging',
    'capabilityRelayNotActive',
    'capabilityProductionE2EENotActive',
    'capabilityTokenRewardsInactive',
  ];
  for (const key of requiredKeys) {
    if (enJson.includes('"release"') && enJson.includes(`"${key}"`)) {
      pass(`en.json: release.${key}`);
    } else {
      fail(`en.json: MISSING release.${key}`);
    }
  }

  // Verify "not active" language is honest
  if (enJson.includes('"capabilityRelayNotActive"')) {
    const idx = enJson.indexOf('"capabilityRelayNotActive"');
    const nearby = enJson.slice(idx, idx + 100);
    if (nearby.includes('not active') || nearby.includes('Not active')) {
      pass('en.json: relay capability uses honest "not active" language');
    } else {
      warn('en.json: relay capability label — verify it uses honest language');
    }
  }
}

// ─── PRE_MVP_STATUS.md truthful claims ───────────────────────────────────────
console.log('\n── PRE_MVP_STATUS.md');
const preMvpPath = resolve(root, 'docs/PRE_MVP_STATUS.md');
if (existsSync(preMvpPath)) {
  const preMvp = readFileSync(preMvpPath, 'utf8');
  pass('docs/PRE_MVP_STATUS.md: exists');
  if (preMvp.includes('Pre-MVP') || preMvp.includes('pre-mvp') || preMvp.includes('pre_mvp')) {
    pass('docs/PRE_MVP_STATUS.md: states Pre-MVP stage');
  } else {
    warn('docs/PRE_MVP_STATUS.md: could not verify Pre-MVP stage label');
  }
  if (preMvp.toLowerCase().includes('relay') && (
    preMvp.includes('not active') || preMvp.includes('Not active') || preMvp.includes('planned')
  )) {
    pass('docs/PRE_MVP_STATUS.md: relay status is honest');
  } else {
    warn('docs/PRE_MVP_STATUS.md: relay status claim — verify manually');
  }
} else {
  warn('docs/PRE_MVP_STATUS.md not found');
}

// ─── SettingsTab controlled test badge ───────────────────────────────────────
console.log('\n── SettingsTab controlled test badge');
const settingsTabPath = resolve(root, 'components/messaging/SettingsTab.tsx');
if (existsSync(settingsTabPath)) {
  const tab = readFileSync(settingsTabPath, 'utf8');
  pass('components/messaging/SettingsTab.tsx: exists');
  if (tab.includes("t('release.controlledTestBadge')")) {
    pass('SettingsTab.tsx: renders controlled test badge via i18n');
  } else {
    fail('SettingsTab.tsx: missing release.controlledTestBadge render');
  }
  if (tab.includes("t('release.useDemoDataOnly')")) {
    pass('SettingsTab.tsx: renders useDemoDataOnly notice via i18n');
  } else {
    fail('SettingsTab.tsx: missing release.useDemoDataOnly render');
  }
} else {
  warn('SettingsTab.tsx not found');
}

console.log(`\n[release-claims] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[release-claims] FAILED — release claims incomplete or inaccurate.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[release-claims] Passed with warnings.');
} else {
  console.log('[release-claims] All release claim checks passed.');
}
