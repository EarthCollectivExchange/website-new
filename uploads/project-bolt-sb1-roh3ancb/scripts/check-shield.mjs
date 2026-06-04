/**
 * EarthOS Shield Foundation Checker — Pass 114
 * Verifies Shield modules exist on disk with the correct exports and key logic.
 * Run: node scripts/check-shield.mjs
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

function readFile(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) { fail(`Missing: ${rel}`); return null; }
  pass(`Exists: ${rel}`);
  return readFileSync(p, 'utf8');
}

function checkExport(content, file, name) {
  if (content.includes(`export`) && content.includes(name)) {
    pass(`${file} exports: ${name}`);
  } else {
    fail(`${file} missing export: ${name}`);
  }
}

function checkContent(content, file, needle, label) {
  if (content.includes(needle)) {
    pass(`${file}: ${label}`);
  } else {
    fail(`${file} missing: ${label}`);
  }
}

// ─── Part 1: Module existence ─────────────────────────────────────────────────
console.log('\n[shield] Checking Shield Foundation modules...\n');
console.log('── Module files');

const taxonomy  = readFile('lib/qlpa/abuseTaxonomy.ts');
const policy    = readFile('lib/qlpa/shieldPolicy.ts');
const reporting = readFile('lib/qlpa/reportingEngine.ts');
const index     = readFile('lib/qlpa/index.ts');

// ─── Part 2: abuseTaxonomy exports ───────────────────────────────────────────
if (taxonomy) {
  console.log('\n── abuseTaxonomy');
  checkExport(taxonomy, 'abuseTaxonomy', 'AbuseCategory');
  checkExport(taxonomy, 'abuseTaxonomy', 'AbuseSeverity');
  checkExport(taxonomy, 'abuseTaxonomy', 'AbuseReportReason');
  checkExport(taxonomy, 'abuseTaxonomy', 'ABUSE_CATEGORY_META');
  checkExport(taxonomy, 'abuseTaxonomy', 'getAbuseMeta');

  // All 12 categories must be present
  const categories = [
    'spam-bot', 'scam', 'malicious-link', 'adult-sexual',
    'sexual-violence', 'non-consensual-content', 'child-safety',
    'harassment', 'hate', 'self-harm', 'illegal-goods', 'unknown',
  ];
  for (const cat of categories) {
    checkContent(taxonomy, 'abuseTaxonomy', `'${cat}'`, `category: ${cat}`);
  }

  // Critical / escalation categories
  checkContent(taxonomy, 'abuseTaxonomy', "'child-safety'", 'child-safety category');
  checkContent(taxonomy, 'abuseTaxonomy', 'requiresEscalation: true', 'requiresEscalation: true present');
  checkContent(taxonomy, 'abuseTaxonomy', "'critical'", 'critical severity present');

  // Privacy comment
  checkContent(taxonomy, 'abuseTaxonomy', 'silently scanned', 'no-silent-scan comment');
}

// ─── Part 3: shieldPolicy exports ────────────────────────────────────────────
if (policy) {
  console.log('\n── shieldPolicy');
  checkExport(policy, 'shieldPolicy', 'ShieldLevel');
  checkExport(policy, 'shieldPolicy', 'RecommendedShieldAction');
  checkExport(policy, 'shieldPolicy', 'DEFAULT_SHIELD_POLICIES');
  checkExport(policy, 'shieldPolicy', 'getRecommendedAction');

  // All shield levels
  for (const level of ['off', 'basic', 'guarded', 'circle', 'child-safe', 'high-risk']) {
    checkContent(policy, 'shieldPolicy', `'${level}'`, `level: ${level}`);
  }

  // All recommended actions
  for (const action of ['allow', 'warn', 'hold', 'hide', 'block', 'escalate']) {
    checkContent(policy, 'shieldPolicy', `'${action}'`, `action: ${action}`);
  }

  // Critical always escalates
  checkContent(policy, 'shieldPolicy', 'requiresEscalation', 'escalation check in getRecommendedAction');

  // Direct chat is off by default (no silent scanning for 1:1)
  checkContent(policy, 'shieldPolicy', "level:                'off'", 'direct space has level: off');
}

// ─── Part 4: reportingEngine exports ─────────────────────────────────────────
if (reporting) {
  console.log('\n── reportingEngine');
  checkExport(reporting, 'reportingEngine', 'ReportTargetType');
  checkExport(reporting, 'reportingEngine', 'ReportStatus');
  checkExport(reporting, 'reportingEngine', 'ReportSubmission');
  checkExport(reporting, 'reportingEngine', 'ReportClassification');
  checkExport(reporting, 'reportingEngine', 'createReport');
  checkExport(reporting, 'reportingEngine', 'validateReport');
  checkExport(reporting, 'reportingEngine', 'classifyReport');

  // All target types
  for (const t of ['message', 'member', 'conversation', 'link', 'media', 'file', 'profile']) {
    checkContent(reporting, 'reportingEngine', `'${t}'`, `target type: ${t}`);
  }

  // All statuses
  for (const s of ['draft', 'submitted', 'reviewing', 'actioned', 'escalated', 'closed']) {
    checkContent(reporting, 'reportingEngine', `'${s}'`, `status: ${s}`);
  }

  // No database or network calls
  const hasDBCall = reporting.includes('supabase') || reporting.includes('fetch(') || reporting.includes('axios');
  if (!hasDBCall) pass('reportingEngine: no database/network calls');
  else fail('reportingEngine: contains database or network call (must be pure logic)');
}

// ─── Part 5: index.ts re-exports ─────────────────────────────────────────────
if (index) {
  console.log('\n── index.ts re-exports');
  checkContent(index, 'index.ts', "'./abuseTaxonomy'", 're-exports abuseTaxonomy');
  checkContent(index, 'index.ts', "'./shieldPolicy'", 're-exports shieldPolicy');
  checkContent(index, 'index.ts', "'./reportingEngine'", 're-exports reportingEngine');
}

// ─── Part 6: trustGraph access states ────────────────────────────────────────
const trustGraph = readFile('lib/qlpa/trustGraph.ts');
if (trustGraph) {
  console.log('\n── trustGraph ConversationAccessState');
  for (const state of ['protected', 'ready', 'allowed', 'pending', 'blocked', 'unknown']) {
    checkContent(trustGraph, 'trustGraph', `'${state}'`, `state: ${state}`);
  }
  checkContent(trustGraph, 'trustGraph', 'severity', 'severity field in AccessStateMeta');
  checkContent(trustGraph, 'trustGraph', 'recommendedSheet', 'recommendedSheet field in AccessStateMeta');
  checkContent(trustGraph, 'trustGraph', "'safe'", "severity: safe");
  checkContent(trustGraph, 'trustGraph', "'caution'", "severity: caution");
  checkContent(trustGraph, 'trustGraph', "'danger'", "severity: danger");
  checkContent(trustGraph, 'trustGraph', "'neutral'", "severity: neutral");
}

// ─── Part 7: JourneyStatusBar — no inline HSL ────────────────────────────────
const statusBar = readFile('components/messaging/JourneyStatusBar.tsx');
if (statusBar) {
  console.log('\n── JourneyStatusBar pill system');
  const hasInlineHSL = statusBar.includes('hsl(38') || statusBar.includes('hsl(4 60');
  if (!hasInlineHSL) pass('JourneyStatusBar: no inline HSL fallbacks');
  else fail('JourneyStatusBar: inline HSL still present (should use ACCESS_STATE_META)');
  checkContent(statusBar, 'JourneyStatusBar', 'ACCESS_STATE_META', 'imports ACCESS_STATE_META');
  checkContent(statusBar, 'JourneyStatusBar', 'ConversationAccessState', 'uses ConversationAccessState');
}

// ─── Part 8: ConversationView — activeSheet source of truth ──────────────────
const convView = readFile('components/messaging/ConversationView.tsx');
if (convView) {
  console.log('\n── ConversationView activeSheet migration');

  const hasOldState = convView.includes('activeOverlay') && !convView.includes('// activeOverlay');
  if (!hasOldState) pass('ConversationView: no activeOverlay state references');
  else warn('ConversationView: possible activeOverlay reference remains');

  checkContent(convView, 'ConversationView', 'useActiveSheet', 'uses useActiveSheet hook');
  checkContent(convView, 'ConversationView', "checkActionPermission('invite-member'", 'invite-member gate present');
  checkContent(convView, 'ConversationView', "checkActionPermission('send-message'", 'send-message gate present');

  const hasOldImport = convView.includes("import type { ActiveOverlay }") || convView.includes("toQlpaActiveSheet");
  if (!hasOldImport) pass('ConversationView: stale ActiveOverlay/toQlpaActiveSheet imports removed');
  else fail('ConversationView: stale ActiveOverlay or toQlpaActiveSheet import still present');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[shield] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[shield] FAILED — fix errors before proceeding.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[shield] Passed with warnings.');
} else {
  console.log('[shield] All checks passed.');
}
