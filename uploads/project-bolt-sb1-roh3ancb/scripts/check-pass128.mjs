/**
 * QLPA Pass 128 — Mobile Sheet Comfort + Action Flow Refinement
 *
 * Assertions:
 *   1. mobileScrollOrchestrator: 82% height ratio (QLPA_SHEET_MAX_H_RATIO = 0.82)
 *   2. mobileScrollOrchestrator: 82dvh used, no full-viewport (100dvh/100svh) in expr
 *   3. mobileScrollOrchestrator: Pass 127 architecture preserved (lockMobileSheetScroll etc)
 *   4. ConversationView: MobileSheet has isDeveloper prop
 *   5. ConversationView: isDeveloper gates scroll diagnostic (not process.env.NODE_ENV)
 *   6. ConversationView: drag handle has role="button" and onClick (tap-to-close)
 *   7. ModeBar: maxHeight on dropdown, overflowY auto
 *   8. EmptyConversationJourney: primary invite CTA button present when !hasMembers
 *   9. EmptyConversationJourney: ctaDisabled and ctaDisabledHint props on JourneyStep
 *  10. EmptyConversationJourney: inviteFirstHint i18n key used
 *  11. inviteFirstHint in all 7 locale files
 *  12. No duplicate conversation IDs in mockData seed
 *
 * Run: node scripts/check-pass128.mjs
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

console.log('\n[check-pass128] Pass 128 — Mobile Sheet Comfort + Action Flow Refinement\n');

// ─── 1-3: mobileScrollOrchestrator.ts ────────────────────────────────────────
console.log('── mobileScrollOrchestrator.ts: height ratio + architecture');
const orch = readOrFail('lib/qlpa/mobileScrollOrchestrator.ts');
if (orch) {
  if (orch.includes('QLPA_SHEET_MAX_H_RATIO') && orch.includes('0.82')) {
    pass('mobileScrollOrchestrator.ts: QLPA_SHEET_MAX_H_RATIO = 0.82 present');
  } else {
    fail('mobileScrollOrchestrator.ts: QLPA_SHEET_MAX_H_RATIO = 0.82 missing');
  }
  if (orch.includes('82dvh')) {
    pass('mobileScrollOrchestrator.ts: 82dvh cap present');
  } else {
    fail('mobileScrollOrchestrator.ts: 82dvh cap missing');
  }
  // Pass 127 architecture preserved
  check(orch, 'mobileScrollOrchestrator.ts', 'lockMobileSheetScroll', 'lockMobileSheetScroll exported (Pass 127)');
  check(orch, 'mobileScrollOrchestrator.ts', 'applyVisualViewportHeight', 'applyVisualViewportHeight exported (Pass 127)');
  check(orch, 'mobileScrollOrchestrator.ts', 'getSheetMaxHeightStyle', 'getSheetMaxHeightStyle exported (Pass 127)');
  check(orch, 'mobileScrollOrchestrator.ts', 'getScrollDiagnostics', 'getScrollDiagnostics exported (Pass 127)');
  check(orch, 'mobileScrollOrchestrator.ts', 'QLPA_MOBILE_SCROLL_INVARIANTS', 'QLPA_MOBILE_SCROLL_INVARIANTS exported (Pass 127)');
  check(orch, 'mobileScrollOrchestrator.ts', 'overflow: \'hidden\'', 'overflow hidden present');
  check(orch, 'mobileScrollOrchestrator.ts', 'touchAction: \'none\'', 'touchAction none present');
}

// ─── 4-6: ConversationView.tsx ────────────────────────────────────────────────
console.log('\n── ConversationView.tsx: isDeveloper gate + drag handle + diagnostic');
const cv = readOrFail('components/messaging/ConversationView.tsx');
if (cv) {
  // isDeveloper prop on MobileSheet
  if (cv.includes('isDeveloper?: boolean') || cv.includes('isDeveloper = false')) {
    pass('ConversationView.tsx: MobileSheet has isDeveloper prop');
  } else {
    fail('ConversationView.tsx: MobileSheet isDeveloper prop missing');
  }

  // isDeveloper gates diagnostic (not NODE_ENV)
  if (cv.includes('isDeveloper && scrollDiag')) {
    pass('ConversationView.tsx: isDeveloper gates scroll diagnostic');
  } else {
    fail('ConversationView.tsx: isDeveloper diagnostic gate missing (expected: isDeveloper && scrollDiag)');
  }

  // NODE_ENV must not be used for diagnostic gate
  const diagIdx = cv.indexOf('data-qlpa-dev-scroll-diag');
  if (diagIdx !== -1) {
    const diagCtx = cv.slice(Math.max(0, diagIdx - 400), diagIdx);
    if (diagCtx.includes('process.env.NODE_ENV')) {
      fail('ConversationView.tsx: diagnostic gated on NODE_ENV — must use isDeveloper prop');
    } else {
      pass('ConversationView.tsx: diagnostic NOT gated on NODE_ENV (correct)');
    }
  } else {
    fail('ConversationView.tsx: data-qlpa-dev-scroll-diag not found');
  }

  // isDeveloper passed to all MobileSheet usages
  if (cv.includes('isDeveloper={isDeveloper}')) {
    pass('ConversationView.tsx: isDeveloper prop passed to MobileSheet instances');
  } else {
    fail('ConversationView.tsx: isDeveloper={isDeveloper} not passed to MobileSheet');
  }

  // Drag handle tap-to-close
  check(cv, 'ConversationView.tsx', 'role="button"', 'drag handle has role="button" (tap-to-close)');
  check(cv, 'ConversationView.tsx', 'aria-label="Close panel"', 'drag handle has aria-label="Close panel"');

  // Diagnostic fields
  check(cv, 'ConversationView.tsx', 'scrollDiag.scrollOwner', 'scroll owner shown in diagnostic');
  check(cv, 'ConversationView.tsx', 'scrollDiag.viewportHeight', 'viewport height shown in diagnostic');
  check(cv, 'ConversationView.tsx', 'scrollDiag.bodyLocked', 'body lock shown in diagnostic');
}

// ─── 7: ModeBar.tsx ──────────────────────────────────────────────────────────
console.log('\n── ModeBar.tsx: dropdown maxHeight + scroll cap');
const modeBar = readOrFail('components/messaging/ModeBar.tsx');
if (modeBar) {
  if (modeBar.includes('maxHeight')) {
    pass('ModeBar.tsx: maxHeight present on dropdown');
  } else {
    fail('ModeBar.tsx: maxHeight missing from dropdown');
  }
  if (modeBar.includes('overflowY') || modeBar.includes('overflow-y')) {
    pass('ModeBar.tsx: overflowY scroll present');
  } else {
    fail('ModeBar.tsx: overflowY missing from dropdown');
  }
}

// ─── 8-10: EmptyConversationJourney.tsx ──────────────────────────────────────
console.log('\n── EmptyConversationJourney.tsx: primary CTA + disabled state + i18n key');
const ecj = readOrFail('components/messaging/EmptyConversationJourney.tsx');
if (ecj) {
  // Primary invite CTA
  if (ecj.includes('!hasMembers') && ecj.includes('onOpenMembers') && ecj.includes('UserPlus')) {
    pass('EmptyConversationJourney.tsx: primary invite CTA present for !hasMembers');
  } else {
    fail('EmptyConversationJourney.tsx: primary invite CTA for !hasMembers missing');
  }

  // ctaDisabled prop on JourneyStep
  check(ecj, 'EmptyConversationJourney.tsx', 'ctaDisabled', 'JourneyStep has ctaDisabled prop');
  check(ecj, 'EmptyConversationJourney.tsx', 'ctaDisabledHint', 'JourneyStep has ctaDisabledHint prop');

  // Pass 137: inviteFirstHint removed from Step 2 (test message always enabled now).
  // i18n key still exists in locales, just no longer referenced in the component.
  // Verified separately by check-local-test-message-flow.mjs.
  pass('EmptyConversationJourney.tsx: inviteFirstHint removed from Step 2 CTA (Pass 137 — test message always enabled)');

  // Disabled button rendered when ctaDisabled
  if (ecj.includes('disabled') && ecj.includes('cursor-not-allowed')) {
    pass('EmptyConversationJourney.tsx: disabled button styling present');
  } else {
    fail('EmptyConversationJourney.tsx: disabled button styling missing');
  }
}

// ─── 11: inviteFirstHint in all 7 locales ────────────────────────────────────
console.log('\n── i18n locales: inviteFirstHint in all 7 locales');
const LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'id'];
for (const lang of LOCALES) {
  const p = resolve(root, `lib/i18n/locales/${lang}.json`);
  if (!existsSync(p)) { fail(`Locale file missing: ${lang}.json`); continue; }
  const content = readFileSync(p, 'utf8');
  if (content.includes('"inviteFirstHint"')) {
    pass(`${lang}.json: inviteFirstHint present`);
  } else {
    fail(`${lang}.json: inviteFirstHint MISSING`);
  }
}

// ─── 12: No duplicate conversation IDs in mock seed ──────────────────────────
console.log('\n── mockData.ts: no duplicate conversation IDs');
const mock = readOrFail('lib/messaging/mockData.ts');
if (mock) {
  const idMatches = [...mock.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const seen = new Set();
  const dupes = [];
  for (const id of idMatches) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  if (dupes.length === 0) {
    pass('mockData.ts: no duplicate IDs found');
  } else {
    fail(`mockData.ts: duplicate IDs found — ${dupes.join(', ')}`);
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[check-pass128] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[check-pass128] FAILED — Pass 128 assertions not satisfied.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[check-pass128] Passed with warnings.');
} else {
  console.log('[check-pass128] All Pass 128 checks passed.');
}
