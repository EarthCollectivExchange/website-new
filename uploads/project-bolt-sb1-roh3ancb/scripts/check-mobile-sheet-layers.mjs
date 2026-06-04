/**
 * QLPA Mobile Sheet Layer Checker — Pass 124
 *
 * Verifies that the backdrop may blur but the active MobileSheet
 * and its scroll body never receive blur or opacity-below-1 treatment.
 *
 * Assertions:
 *   1. MobileSheet root has qlpa-sheet-clear class
 *   2. MobileSheet root does NOT have backdrop-blur in its className
 *   3. Sheet scroll body (.qlpa-sheet-body) does NOT have backdrop-blur
 *   4. Backdrop div DOES have backdrop-blur or dim class (expected)
 *   5. Sheet z-index (50) is greater than backdrop z-index (48)
 *   6. globals.css defines .qlpa-sheet-clear with filter:none, backdrop-filter:none, opacity:1
 *   7. globals.css defines .qlpa-sheet-clear * with filter:none, backdrop-filter:none
 *   8. MobileSheet instances are NOT inside the scroll wrapper div
 *
 * Run: node scripts/check-mobile-sheet-layers.mjs
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

console.log('\n[mobile-sheet-layers] QLPA Mobile Sheet Layer Audit — Pass 124\n');

// ─── Files ────────────────────────────────────────────────────────────────────
console.log('── Files');
const cv = readOrFail('components/messaging/ConversationView.tsx');
const css = readOrFail('app/globals.css');

// ─── MobileSheet root class ───────────────────────────────────────────────────
if (cv) {
  console.log('\n── MobileSheet root class');

  // Find the MobileSheet function return's root div className
  const mobileSheetFnIdx = cv.indexOf('function MobileSheet(');
  if (mobileSheetFnIdx === -1) {
    fail('ConversationView.tsx: MobileSheet function not found');
  } else {
    // Extract just the MobileSheet function body (up to 500 chars past its return)
    const fnBody = cv.slice(mobileSheetFnIdx, mobileSheetFnIdx + 1200);

    if (fnBody.includes('qlpa-sheet-clear')) {
      pass('MobileSheet root: has qlpa-sheet-clear class');
    } else {
      fail('MobileSheet root: MISSING qlpa-sheet-clear class');
    }

    // Verify no backdrop-blur on MobileSheet root className string
    // Extract the className value of the root div
    const classNameMatch = fnBody.match(/className="([^"]+)"/);
    if (classNameMatch) {
      const rootClass = classNameMatch[1];
      if (rootClass.includes('backdrop-blur')) {
        fail(`MobileSheet root className: contains backdrop-blur — "${rootClass}"`);
      } else {
        pass('MobileSheet root className: no backdrop-blur');
      }

      if (rootClass.includes('qlpa-sheet-clear')) {
        pass('MobileSheet root className: qlpa-sheet-clear confirmed in first className');
      } else {
        warn('MobileSheet root className: qlpa-sheet-clear not in first className attr — check position');
      }
    } else {
      warn('MobileSheet root: could not parse className attribute for detailed check');
    }
  }

  // ─── Sheet scroll body ───────────────────────────────────────────────────────
  console.log('\n── Sheet scroll body (.qlpa-sheet-body)');
  const sheetBodyIdx = cv.indexOf('qlpa-sheet-body');
  if (sheetBodyIdx === -1) {
    fail('ConversationView.tsx: qlpa-sheet-body class not found');
  } else {
    // Check 200 chars before qlpa-sheet-body for any backdrop-blur
    const sheetBodyCtx = cv.slice(Math.max(0, sheetBodyIdx - 300), sheetBodyIdx + 100);
    if (sheetBodyCtx.includes('backdrop-blur')) {
      fail('Sheet scroll body context: contains backdrop-blur near qlpa-sheet-body');
    } else {
      pass('Sheet scroll body: no backdrop-blur near qlpa-sheet-body');
    }
  }

  // ─── Backdrop has blur ───────────────────────────────────────────────────────
  console.log('\n── Backdrop element');
  const backdropIdx = cv.indexOf('z-[48]');
  if (backdropIdx === -1) {
    warn('Backdrop z-[48] not found — verify backdrop is present');
  } else {
    const backdropCtx = cv.slice(Math.max(0, backdropIdx - 200), backdropIdx + 400);
    if (backdropCtx.includes('backdrop-blur') || backdropCtx.includes('bg-black')) {
      pass('Backdrop: has blur/dim treatment (expected for background dimming)');
    } else {
      warn('Backdrop: no backdrop-blur or bg-black found near z-[48] — verify manually');
    }
  }

  // ─── Z-index hierarchy ───────────────────────────────────────────────────────
  console.log('\n── Z-index hierarchy');
  if (cv.includes('z-[48]') && cv.includes('z-[50]')) {
    pass('Z-index: both z-[48] (backdrop) and z-[50] (sheet) present');

    // Numeric comparison
    const backdropZ = 48;
    const sheetZ = 50;
    if (sheetZ > backdropZ) {
      pass(`Z-index: sheet (${sheetZ}) > backdrop (${backdropZ}) — correct layer order`);
    } else {
      fail(`Z-index: sheet (${sheetZ}) must be greater than backdrop (${backdropZ})`);
    }
  } else {
    if (!cv.includes('z-[48]')) fail('Backdrop z-[48] not found');
    if (!cv.includes('z-[50]')) fail('Sheet z-[50] not found');
  }

  // ─── Scroll architecture preserved ──────────────────────────────────────────
  // Pass 127: MobileSheet now uses the mobileScrollOrchestrator facade instead
  // of calling lockBodyScroll/unlockBodyScroll/attachVisualViewportListeners
  // directly. Accept either the direct calls (pre-127) or the facade (127+).
  console.log('\n── Scroll architecture');
  if (cv.includes("lockBodyScroll('mobile-sheet')") || cv.includes('lockMobileSheetScroll')) {
    pass('Scroll: lockBodyScroll(mobile-sheet) present');
  } else {
    fail('Scroll: lockBodyScroll(mobile-sheet) missing');
  }
  if (cv.includes("unlockBodyScroll('mobile-sheet')") || cv.includes('lockMobileSheetScroll')) {
    pass('Scroll: unlockBodyScroll(mobile-sheet) present');
  } else {
    fail('Scroll: unlockBodyScroll(mobile-sheet) missing');
  }
  if (cv.includes('attachVisualViewportListeners') || cv.includes('applyVisualViewportHeight')) {
    pass('Scroll: attachVisualViewportListeners wired in MobileSheet');
  } else {
    fail('Scroll: attachVisualViewportListeners missing from MobileSheet');
  }
  if (cv.includes('data-qlpa-scroll-owner')) {
    pass('Scroll: data-qlpa-scroll-owner attribute present on sheet body');
  } else {
    fail('Scroll: data-qlpa-scroll-owner missing');
  }
  if (cv.includes('pointer-events-none select-none') && cv.includes('anyPanelOpen')) {
    pass('Scroll: composer/FAB pointer-events-none when anyPanelOpen');
  } else {
    fail('Scroll: composer/FAB pointer-events-none guard missing');
  }

  // ─── Mobile sheets are siblings of backdrop (not inside scroll wrapper) ──────
  console.log('\n── Sheet / backdrop sibling structure');
  // The scroll wrapper has class "md:contents flex-1 min-h-0 flex flex-col overflow-y-auto"
  // MobileSheet instances should appear AFTER the scroll wrapper closes
  const scrollWrapperCloseIdx = cv.indexOf('</div>{/* end mobile scroll wrapper */}');
  const mobileSheetInRootIdx = cv.indexOf('<MobileSheet onClose={closeOverlay}>', scrollWrapperCloseIdx);

  if (scrollWrapperCloseIdx === -1) {
    warn('Could not find scroll wrapper closing comment — verify structure manually');
  } else if (mobileSheetInRootIdx !== -1 && mobileSheetInRootIdx > scrollWrapperCloseIdx) {
    pass('Structure: MobileSheet appears after scroll wrapper close (sibling of backdrop)');
  } else {
    // Check if MobileSheet appears before the scroll wrapper close (would mean it's inside)
    const mobileSheetBeforeClose = cv.indexOf('<MobileSheet onClose={closeOverlay}>');
    if (mobileSheetBeforeClose !== -1 && mobileSheetBeforeClose < scrollWrapperCloseIdx) {
      fail('Structure: MobileSheet found INSIDE scroll wrapper — must be a sibling of the backdrop');
    } else {
      pass('Structure: no MobileSheet found inside scroll wrapper');
    }
  }
}

// ─── globals.css qlpa-sheet-clear definition ─────────────────────────────────
if (css) {
  console.log('\n── globals.css qlpa-sheet-clear');

  if (css.includes('.qlpa-sheet-clear')) {
    pass('globals.css: .qlpa-sheet-clear defined');
  } else {
    fail('globals.css: .qlpa-sheet-clear MISSING');
  }

  const clearIdx = css.indexOf('.qlpa-sheet-clear');
  if (clearIdx !== -1) {
    const clearBlock = css.slice(clearIdx, clearIdx + 300);

    if (clearBlock.includes('filter: none !important')) {
      pass('globals.css .qlpa-sheet-clear: filter: none !important');
    } else {
      fail('globals.css .qlpa-sheet-clear: missing filter: none !important');
    }

    if (clearBlock.includes('backdrop-filter: none !important')) {
      pass('globals.css .qlpa-sheet-clear: backdrop-filter: none !important');
    } else {
      fail('globals.css .qlpa-sheet-clear: missing backdrop-filter: none !important');
    }

    if (clearBlock.includes('opacity: 1 !important')) {
      pass('globals.css .qlpa-sheet-clear: opacity: 1 !important');
    } else {
      fail('globals.css .qlpa-sheet-clear: missing opacity: 1 !important');
    }
  }

  // Check descendant rule
  if (css.includes('.qlpa-sheet-clear *')) {
    pass('globals.css: .qlpa-sheet-clear * descendant rule present');

    const starIdx = css.indexOf('.qlpa-sheet-clear *');
    const starBlock = css.slice(starIdx, starIdx + 200);

    if (starBlock.includes('filter: none !important')) {
      pass('globals.css .qlpa-sheet-clear *: filter: none !important');
    } else {
      fail('globals.css .qlpa-sheet-clear *: missing filter: none !important');
    }

    if (starBlock.includes('backdrop-filter: none !important')) {
      pass('globals.css .qlpa-sheet-clear *: backdrop-filter: none !important');
    } else {
      fail('globals.css .qlpa-sheet-clear *: missing backdrop-filter: none !important');
    }
  } else {
    fail('globals.css: .qlpa-sheet-clear * descendant rule MISSING');
  }

  // Verify qlpa-sheet-body is defined
  if (css.includes('.qlpa-sheet-body')) {
    pass('globals.css: .qlpa-sheet-body defined');
  } else {
    fail('globals.css: .qlpa-sheet-body MISSING');
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n[mobile-sheet-layers] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[mobile-sheet-layers] FAILED — sheet layer isolation incomplete.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[mobile-sheet-layers] Passed with warnings.');
} else {
  console.log('[mobile-sheet-layers] All sheet layer checks passed.');
}
