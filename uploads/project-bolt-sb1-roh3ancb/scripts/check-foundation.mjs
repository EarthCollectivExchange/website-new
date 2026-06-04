/**
 * EarthOS Foundation Checker
 * Validates that the root architecture is in place.
 * Run: node scripts/check-foundation.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let warnings = 0;
let errors = 0;

function pass(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.warn(`  ⚠ ${msg}`); warnings++; }
function fail(msg) { console.error(`  ✗ ${msg}`); errors++; }

function checkFile(rel) {
  if (existsSync(resolve(root, rel))) {
    pass(rel);
    return true;
  } else {
    fail(`Missing: ${rel}`);
    return false;
  }
}

function checkDir(rel) {
  if (existsSync(resolve(root, rel))) {
    pass(`dir: ${rel}`);
    return true;
  } else {
    fail(`Missing dir: ${rel}`);
    return false;
  }
}

console.log('\n[foundation] Checking QLPA Matrix Source root architecture...\n');

// ─── Required directories ─────────────────────────────────────────────────────
console.log('── Directories');
checkDir('lib/foundation');
checkDir('lib/qlpa');
checkDir('lib/design');
checkDir('lib/i18n');
checkDir('lib/stats');
checkDir('lib/privacy');
checkDir('lib/security');
checkDir('lib/messaging');
checkDir('components/foundation');
checkDir('components/stats');
checkDir('scripts');

// ─── Foundation files ─────────────────────────────────────────────────────────
console.log('\n── Foundation');
checkFile('lib/foundation/appLayers.ts');
checkFile('lib/foundation/appCapabilities.ts');
checkFile('lib/foundation/appConstants.ts');
checkFile('lib/foundation/appReadiness.ts');
checkFile('lib/foundation/featureFlags.ts');
checkFile('lib/foundation/sourceIdentity.ts');
checkFile('lib/foundation/modes.ts');
checkFile('lib/foundation/preferencesContext.tsx');
checkFile('lib/foundation/index.ts');

// ─── QLPA files ───────────────────────────────────────────────────────────────
console.log('\n── QLPA');
checkFile('lib/qlpa/languageProtocol.ts');
checkFile('lib/qlpa/netShield.ts');
checkFile('lib/qlpa/terminology.ts');
checkFile('lib/qlpa/qlpaPrinciples.ts');
checkFile('lib/qlpa/qlpaGuards.ts');
checkFile('lib/qlpa/index.ts');

// ─── Design tokens ────────────────────────────────────────────────────────────
console.log('\n── Design');
checkFile('lib/design/phiTokens.ts');
checkFile('lib/design/fibonacciScale.ts');
checkFile('lib/design/layoutRhythm.ts');
checkFile('lib/design/touchTargets.ts');
checkFile('lib/design/zIndex.ts');
checkFile('lib/design/index.ts');

// ─── i18n ─────────────────────────────────────────────────────────────────────
console.log('\n── i18n');
checkFile('lib/i18n/context.tsx');
checkFile('lib/i18n/dictionary.ts');
checkFile('lib/i18n/useT.ts');
checkFile('lib/i18n/localeRegistry.ts');
checkFile('lib/i18n/localeTypes.ts');
checkFile('lib/i18n/missingKeyPolicy.ts');
checkFile('lib/i18n/keys.ts');
for (const locale of ['en', 'fr', 'id', 'es', 'de', 'it', 'pt']) {
  checkFile(`lib/i18n/locales/${locale}.json`);
}

// ─── Stats ────────────────────────────────────────────────────────────────────
console.log('\n── Stats');
checkFile('lib/stats/statsTypes.ts');
checkFile('lib/stats/statsModes.ts');
checkFile('lib/stats/statsPrivacy.ts');
checkFile('lib/stats/statsStore.ts');
checkFile('lib/stats/statsEvents.ts');
checkFile('lib/stats/statsSelectors.ts');
checkFile('lib/stats/lightAnalyzer.ts');
checkFile('lib/stats/completeAnalyzer.ts');
checkFile('lib/stats/statsExport.ts');
checkFile('lib/stats/index.ts');

// ─── Privacy ──────────────────────────────────────────────────────────────────
console.log('\n── Privacy');
checkFile('lib/privacy/dataClasses.ts');
checkFile('lib/privacy/contentBoundaries.ts');
checkFile('lib/privacy/retentionRules.ts');
checkFile('lib/privacy/localOnlyRules.ts');
checkFile('lib/privacy/index.ts');

// ─── Security ─────────────────────────────────────────────────────────────────
console.log('\n── Security');
checkFile('lib/security/trustLevels.ts');
checkFile('lib/security/clearScopes.ts');
checkFile('lib/security/protectionStates.ts');
checkFile('lib/security/deliveryStates.ts');
checkFile('lib/security/index.ts');

// ─── Foundation components ────────────────────────────────────────────────────
console.log('\n── Foundation Components');
checkFile('components/foundation/FoundationStatusBadge.tsx');
checkFile('components/foundation/PreferenceBoundary.tsx');
checkFile('components/foundation/DeveloperOnly.tsx');
checkFile('components/foundation/AdvancedOnly.tsx');

// ─── Stats components ─────────────────────────────────────────────────────────
console.log('\n── Stats Components');
checkFile('components/stats/StatsModeBadge.tsx');
checkFile('components/stats/StatsSummaryCard.tsx');
checkFile('components/stats/StatsPrivacyNotice.tsx');
checkFile('components/stats/StatsPlaceholderPanel.tsx');

// ─── Preferences ─────────────────────────────────────────────────────────────
console.log('\n── Preferences');
const prefsFile = resolve(root, 'lib/foundation/preferencesContext.tsx');
if (existsSync(prefsFile)) {
  const content = readFileSync(prefsFile, 'utf8');
  const checks = [
    ['statsMode',            content.includes('statsMode')],
    ['backgroundMode',       content.includes('backgroundMode')],
    ['reducedMotion',        content.includes('reducedMotion')],
    ['compactMode',          content.includes('compactMode')],
    ['developerDiagnostics', content.includes('developerDiagnostics')],
  ];
  for (const [key, present] of checks) {
    if (present) pass(`PreferencesContext includes: ${key}`);
    else warn(`PreferencesContext missing: ${key}`);
  }
} else {
  fail('lib/foundation/preferencesContext.tsx not found');
}

// ─── Stats privacy guard ──────────────────────────────────────────────────────
console.log('\n── Stats Privacy Guard');
const statsPrivacyFile = resolve(root, 'lib/stats/statsPrivacy.ts');
if (existsSync(statsPrivacyFile)) {
  const content = readFileSync(statsPrivacyFile, 'utf8');
  const prohibited = ['body', 'content', 'privateKey', 'phone', 'email', 'contactName', 'fileName'];
  let allChecked = true;
  for (const field of prohibited) {
    if (content.includes(field)) {
      pass(`Stats privacy guards field: ${field}`);
    } else {
      warn(`Stats privacy may not guard: ${field}`);
      allChecked = false;
    }
  }
  if (allChecked) pass('All prohibited fields are guarded');
} else {
  fail('lib/stats/statsPrivacy.ts not found');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[foundation] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[foundation] FAILED — fix errors before proceeding.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[foundation] Passed with warnings.');
} else {
  console.log('[foundation] All checks passed.');
}
