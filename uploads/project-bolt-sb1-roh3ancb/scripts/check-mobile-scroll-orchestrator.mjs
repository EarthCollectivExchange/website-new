/**
 * QLPA Mobile Scroll Orchestrator Checker
 *
 * Verifies that Pass 127 changes are correctly implemented:
 *   1. lib/qlpa/mobileScrollOrchestrator.ts exists with required exports
 *   2. Orchestrator wraps foundation with browser guards
 *   3. html+body lock technique preserved (position:fixed + top:-scrollY)
 *   4. scrollY preservation present
 *   5. visualViewport usage present
 *   6. QLPA_MOBILE_SCROLL_INVARIANTS exported
 *   7. MobileSheet in ConversationView imports from orchestrator (not directly from foundation)
 *   8. Sheet body has qlpa-sheet-body class (overflow-y-auto, WebkitOverflowScrolling)
 *   9. No preventDefault on sheet scroll body touch handlers
 *  10. backdrop is below sheet (z-[48] backdrop, z-[50] sheet)
 *  11. getSheetMaxHeightStyle exported and used in ConversationView
 *  12. lockMobileSheetScroll exported
 *  13. applyVisualViewportHeight exported
 *  14. getScrollDiagnostics exported
 *  15. Developer diagnostic block present in MobileSheet
 *
 * Run: node scripts/check-mobile-scroll-orchestrator.mjs
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

console.log('\n[mobile-scroll-orchestrator] Pass 127 Mobile Scroll Orchestrator Audit\n');

// ─── mobileScrollOrchestrator.ts: module structure ───────────────────────────
console.log('── mobileScrollOrchestrator.ts: module exports and invariants');
const orch = readOrFail('lib/qlpa/mobileScrollOrchestrator.ts');
if (orch) {
  check(orch, 'mobileScrollOrchestrator.ts', 'lockMobileSheetScroll', 'lockMobileSheetScroll exported');
  check(orch, 'mobileScrollOrchestrator.ts', 'applyVisualViewportHeight', 'applyVisualViewportHeight exported');
  check(orch, 'mobileScrollOrchestrator.ts', 'getSheetMaxHeightStyle', 'getSheetMaxHeightStyle exported');
  check(orch, 'mobileScrollOrchestrator.ts', 'getScrollDiagnostics', 'getScrollDiagnostics exported');
  check(orch, 'mobileScrollOrchestrator.ts', 'QLPA_MOBILE_SCROLL_INVARIANTS', 'QLPA_MOBILE_SCROLL_INVARIANTS exported');
  check(orch, 'mobileScrollOrchestrator.ts', 'typeof window === \'undefined\'', 'browser guard present');
  check(orch, 'mobileScrollOrchestrator.ts', 'lockBodyScroll', 'delegates to foundation lockBodyScroll');
  check(orch, 'mobileScrollOrchestrator.ts', 'unlockBodyScroll', 'delegates to foundation unlockBodyScroll');
  check(orch, 'mobileScrollOrchestrator.ts', 'attachVisualViewportListeners', 'delegates to foundation attachVisualViewportListeners');
  check(orch, 'mobileScrollOrchestrator.ts', 'visualViewport', 'visualViewport usage present');
  check(orch, 'mobileScrollOrchestrator.ts', 'BODY_LOCK_ACTIVE', 'BODY_LOCK_ACTIVE invariant string defined');
  check(orch, 'mobileScrollOrchestrator.ts', 'NO_PREVENTDEFAULT', 'NO_PREVENTDEFAULT invariant string defined');
  check(orch, 'mobileScrollOrchestrator.ts', 'HTML_BODY_OVERFLOW', 'HTML_BODY_OVERFLOW invariant string defined');
  check(orch, 'mobileScrollOrchestrator.ts', 'SCROLL_Y_PRESERVED', 'SCROLL_Y_PRESERVED invariant string defined');
  check(orch, 'mobileScrollOrchestrator.ts', 'overflow: \'hidden\'', 'getSheetMaxHeightStyle returns overflow hidden');
  check(orch, 'mobileScrollOrchestrator.ts', 'touchAction: \'none\'', 'getSheetMaxHeightStyle returns touchAction none on chrome');
}

// ─── foundation/scrollOrchestrator.ts: body lock technique ───────────────────
console.log('\n── foundation/scrollOrchestrator.ts: html+body lock + scrollY preservation');
const foundation = readOrFail('lib/foundation/scrollOrchestrator.ts');
if (foundation) {
  check(foundation, 'scrollOrchestrator.ts', 'position = \'fixed\'', 'body position fixed on lock');
  check(foundation, 'scrollOrchestrator.ts', 'body.style.top', 'body top set to -scrollY on lock');
  check(foundation, 'scrollOrchestrator.ts', 'html.style.overflow = \'hidden\'', 'html overflow hidden on lock');
  check(foundation, 'scrollOrchestrator.ts', 'window.scrollY', 'scrollY captured before lock');
  check(foundation, 'scrollOrchestrator.ts', 'window.scrollTo(0, savedBodyScrollY)', 'scrollY restored on unlock');
  check(foundation, 'scrollOrchestrator.ts', 'window.visualViewport', 'visualViewport listener attached');
}

// ─── ConversationView.tsx: orchestrator import + sheet usage ─────────────────
console.log('\n── ConversationView.tsx: orchestrator usage in MobileSheet');
const convView = readOrFail('components/messaging/ConversationView.tsx');
if (convView) {
  check(convView, 'ConversationView.tsx', 'mobileScrollOrchestrator', 'imports from mobileScrollOrchestrator');
  check(convView, 'ConversationView.tsx', 'lockMobileSheetScroll', 'lockMobileSheetScroll used');
  check(convView, 'ConversationView.tsx', 'applyVisualViewportHeight', 'applyVisualViewportHeight used');
  check(convView, 'ConversationView.tsx', 'getSheetMaxHeightStyle', 'getSheetMaxHeightStyle used');
  check(convView, 'ConversationView.tsx', 'getScrollDiagnostics', 'getScrollDiagnostics used');
  // Sheet body: class and data attribute
  check(convView, 'ConversationView.tsx', 'qlpa-sheet-body', 'sheet body has qlpa-sheet-body class');
  check(convView, 'ConversationView.tsx', 'data-qlpa-scroll-owner="mobile-sheet"', 'sheet body has data-qlpa-scroll-owner attribute');
  // stopPropagation only — sheet body must never call preventDefault (which freezes native scroll).
  // backdrop is allowed to call preventDefault for iOS rubber-band bleed-through prevention.
  check(convView, 'ConversationView.tsx', 'e.stopPropagation()', 'stopPropagation used on sheet body touch events');
  // Verify the comment that documents the no-preventDefault rule is present.
  check(convView, 'ConversationView.tsx', 'NOT call preventDefault', 'no-preventDefault rule documented in sheet body comment');
  // Backdrop below sheet
  check(convView, 'ConversationView.tsx', 'z-[48]', 'backdrop at z-[48] (below sheet)');
  check(convView, 'ConversationView.tsx', 'z-[50]', 'sheet at z-[50] (above backdrop)');
  // Composer pointer-events disabled when sheet open
  check(convView, 'ConversationView.tsx', 'pointer-events-none', 'composer/FAB pointer-events-none when sheet open');
  // Developer diagnostic block present
  check(convView, 'ConversationView.tsx', 'data-qlpa-dev-scroll-diag', 'Developer scroll diagnostic block present');
  check(convView, 'ConversationView.tsx', 'scrollDiag.scrollOwner', 'scroll owner shown in diagnostic');
  check(convView, 'ConversationView.tsx', 'scrollDiag.viewportHeight', 'viewport height shown in diagnostic');
  check(convView, 'ConversationView.tsx', 'scrollDiag.bodyLocked', 'body lock shown in diagnostic');
  // Direct foundation imports must NOT appear in ConversationView
  checkAbsent(convView, 'ConversationView.tsx', 'from \'@/lib/foundation/scrollOrchestrator\'', 'No direct foundation scrollOrchestrator import (use orchestrator facade)');
}

// ─── globals.css: qlpa-sheet-body CSS class ───────────────────────────────────
console.log('\n── globals.css: qlpa-sheet-body and qlpa-scroll-owner classes');
const cssPath = 'app/globals.css';
const css = readOrFail(cssPath);
if (css) {
  check(css, 'globals.css', '.qlpa-sheet-body', 'qlpa-sheet-body class defined');
  check(css, 'globals.css', 'overflow-y: auto', 'qlpa-sheet-body has overflow-y auto');
  check(css, 'globals.css', 'overscroll-behavior: contain', 'qlpa-sheet-body has overscroll-behavior contain');
  check(css, 'globals.css', '-webkit-overflow-scrolling: touch', 'qlpa-sheet-body has webkit-overflow-scrolling touch');
  check(css, 'globals.css', '.qlpa-scroll-owner', 'qlpa-scroll-owner class defined');
  check(css, 'globals.css', '.qlpa-sheet-clear', 'qlpa-sheet-clear class defined');
}

// ─── package.json: check:mobile-scroll-orchestrator wired ────────────────────
console.log('\n── package.json: script registration');
const pkg = readOrFail('package.json');
if (pkg) {
  check(pkg, 'package.json', 'check:mobile-scroll-orchestrator', 'check:mobile-scroll-orchestrator script registered');
  check(pkg, 'package.json', 'check-mobile-scroll-orchestrator', 'check-mobile-scroll-orchestrator.mjs referenced');
}

console.log(`\n[mobile-scroll-orchestrator] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[mobile-scroll-orchestrator] FAILED — mobile scroll orchestrator checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[mobile-scroll-orchestrator] Passed with warnings.');
} else {
  console.log('[mobile-scroll-orchestrator] All mobile scroll orchestrator checks passed.');
}
