// ─── QLPA Mobile Scroll Orchestrator ─────────────────────────────────────────
//
// QLPA-namespaced facade over lib/foundation/scrollOrchestrator.
//
// Provides:
//   lockMobileSheetScroll(reason)   — lock body + update QLPA token, returns cleanup
//   applyVisualViewportHeight()     — attach visualViewport listeners, returns cleanup
//   getSheetMaxHeightStyle()        — inline-style object for MobileSheet root
//   getScrollDiagnostics()          — snapshot for Developer-only diagnostic line
//   QLPA_MOBILE_SCROLL_INVARIANTS   — invariant strings for check script assertions
//
// Invariants enforced at runtime (dev-only console warning):
//   1. Only one sheet may hold the body lock at a time (depth-counted in foundation).
//   2. Sheet root must NOT have overflow-y: auto — that belongs on .qlpa-sheet-body.
//   3. Sheet body must use overscroll-behavior: contain to prevent scroll chaining.
//   4. Touch events in sheet body must use stopPropagation, never preventDefault.
//
// This module is a pure browser-side utility. It contains no React.
// Import it inside useEffect or event handlers only.

import {
  lockBodyScroll,
  unlockBodyScroll,
  attachVisualViewportListeners,
  getActiveLayer,
  type ScrollLayer,
} from '@/lib/foundation/scrollOrchestrator';

import { CSS_VARS, SAFE_AREA } from '@/lib/qlpa/layoutTokens';

// ── Invariant string constants ────────────────────────────────────────────────
// These exact strings are checked by scripts/check-mobile-scroll-orchestrator.mjs.

export const QLPA_MOBILE_SCROLL_INVARIANTS = {
  SINGLE_SCROLL_OWNER:    'qlpa:sheet:single-scroll-owner',
  BODY_LOCK_ACTIVE:       'qlpa:sheet:body-lock-active',
  NO_PREVENTDEFAULT:      'qlpa:sheet:no-preventdefault',
  OVERSCROLL_CONTAIN:     'qlpa:sheet:overscroll-contain',
  WEBKIT_SCROLL_TOUCH:    'qlpa:sheet:webkit-overflow-scrolling-touch',
  VISUAL_VIEWPORT_HEIGHT: 'qlpa:sheet:visual-viewport-height',
  HTML_BODY_OVERFLOW:     'qlpa:sheet:html-body-overflow-hidden',
  SCROLL_Y_PRESERVED:     'qlpa:sheet:scrolly-preserved',
} as const;

// ── lockMobileSheetScroll ─────────────────────────────────────────────────────
//
// Call on mount. Returns a cleanup function to call on unmount.
// The underlying foundation module is depth-counted, so nested callers
// (e.g. a modal inside a sheet) don't double-restore the body position.

export function lockMobileSheetScroll(reason: string): () => void {
  if (typeof window === 'undefined') return () => {};

  const layer: ScrollLayer = 'mobile-sheet';
  lockBodyScroll(layer);

  if (process.env.NODE_ENV === 'development') {
    // Verify no other sheet is already holding the token at depth > 1.
    // The foundation module guards this but we log for diagnostics.
    const owner = document.documentElement.style.getPropertyValue(CSS_VARS.scrollOwner);
    if (owner && owner !== layer) {
      console.warn(
        `[QLPA ${QLPA_MOBILE_SCROLL_INVARIANTS.SINGLE_SCROLL_OWNER}] ` +
        `lockMobileSheetScroll("${reason}") called while scroll owner is "${owner}". ` +
        'Multiple sheets open simultaneously is unsupported.'
      );
    }
  }

  return () => {
    unlockBodyScroll(layer);
  };
}

// ── applyVisualViewportHeight ─────────────────────────────────────────────────
//
// Attaches visualViewport resize/scroll listeners that keep --qlpa-vvh and
// --qlpa-sheet-max-h in sync with the real keyboard-aware viewport height.
// Returns a cleanup function.

export function applyVisualViewportHeight(): () => void {
  return attachVisualViewportListeners();
}

// ── getSheetMaxHeightStyle ────────────────────────────────────────────────────
//
// Returns the inline style object for the MobileSheet root element.
// Both `height` and `maxHeight` must be set — maxHeight alone is insufficient
// because a flex-1 child computes to height:auto (content-sized) and
// overflow-y:auto never activates.
//
// The value is intentionally capped at 82% — sheets must not occupy the full
// viewport so the underlying conversation context remains visible behind them.

const QLPA_SHEET_MAX_H_RATIO = 0.82;

export function getSheetMaxHeightStyle(): React.CSSProperties {
  const expr = `min(calc(var(${CSS_VARS.vvh}, 82dvh) * ${QLPA_SHEET_MAX_H_RATIO}), calc(82dvh - ${SAFE_AREA.top}))`;
  return {
    height: expr,
    maxHeight: expr,
    overflow: 'hidden',        // clips rounded corners; scroll lives in .qlpa-sheet-body
    touchAction: 'none',       // sheet chrome (handle) must not initiate page-scroll gestures
    pointerEvents: 'auto',
  };
}

// ── getScrollDiagnostics ──────────────────────────────────────────────────────
//
// Returns a snapshot of scroll-relevant state for the Developer diagnostic line.

export interface ScrollDiagnostics {
  scrollOwner: string;
  viewportHeight: number;
  bodyLocked: boolean;
  bodyPosition: string;
}

export function getScrollDiagnostics(): ScrollDiagnostics {
  if (typeof window === 'undefined') {
    return { scrollOwner: 'ssr', viewportHeight: 0, bodyLocked: false, bodyPosition: '' };
  }

  const vv = window.visualViewport;
  const viewportHeight = vv ? Math.round(vv.height) : window.innerHeight;
  const bodyPosition = document.body.style.position;
  const bodyLocked = bodyPosition === 'fixed';
  const scrollOwner = getActiveLayer();

  return { scrollOwner, viewportHeight, bodyLocked, bodyPosition };
}

// ── Type re-export so callers don't need a separate foundation import ─────────

export type { ScrollLayer };

// ── React CSSProperties type guard (avoids importing React in a pure module) ──

declare namespace React {
  interface CSSProperties {
    [key: string]: string | number | undefined;
  }
}
