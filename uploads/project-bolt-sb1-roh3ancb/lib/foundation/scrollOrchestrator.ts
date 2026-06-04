// ─── QLPA Scroll Orchestrator ─────────────────────────────────────────────────
//
// Single source of truth for vertical scroll ownership across the app.
// Exactly one layer owns scroll at any moment.
//
// Scroll layer priority (highest wins):
//   locked        — no layer may scroll (e.g. during transitions)
//   modal         — full-screen dialog
//   mobile-sheet  — bottom sheet panel
//   native-select — OS-level select picker
//   message-thread
//   conversation-list
//   page
//
// CSS custom properties written to :root:
//   --qlpa-vvh           visual viewport height (px, keyboard-aware)
//   --qlpa-scroll-owner  current layer id as a string token
//   --qlpa-sheet-max-h   computed sheet max height
//   --qlpa-composer-h    composer bar height (written by composer component)
//   --qlpa-bottom-nav-h  bottom nav height  (written by nav component)

export type ScrollLayer =
  | 'page'
  | 'conversation-list'
  | 'message-thread'
  | 'mobile-sheet'
  | 'modal'
  | 'native-select'
  | 'locked';

interface ScrollOwnerEntry {
  id: string;
  element: HTMLElement;
  savedScrollTop: number;
}

// ── Module-level state (singleton) ───────────────────────────────────────────

let activeLayer: ScrollLayer = 'page';
let savedBodyScrollY = 0;
let bodyLockDepth = 0;

const owners = new Map<string, ScrollOwnerEntry>();

let savedBodyStyles: {
  position: string;
  top: string;
  width: string;
  overflow: string;
} | null = null;

let savedHtmlOverflow = '';

// ── Visual viewport tracker ───────────────────────────────────────────────────

let vvhListenersAttached = false;

function updateVisualViewportHeight(): void {
  if (typeof window === 'undefined') return;
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  const root = document.documentElement;
  root.style.setProperty('--qlpa-vvh', `${h}px`);
  root.style.setProperty(
    '--qlpa-sheet-max-h',
    `calc(${h}px - env(safe-area-inset-top, 0px) - 1rem)`
  );
}

export function attachVisualViewportListeners(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (vvhListenersAttached) return () => {};
  vvhListenersAttached = true;

  updateVisualViewportHeight();

  const vv = window.visualViewport;
  vv?.addEventListener('resize', updateVisualViewportHeight);
  vv?.addEventListener('scroll', updateVisualViewportHeight);
  window.addEventListener('resize', updateVisualViewportHeight);

  return () => {
    vv?.removeEventListener('resize', updateVisualViewportHeight);
    vv?.removeEventListener('scroll', updateVisualViewportHeight);
    window.removeEventListener('resize', updateVisualViewportHeight);
    document.documentElement.style.removeProperty('--qlpa-vvh');
    document.documentElement.style.removeProperty('--qlpa-sheet-max-h');
    vvhListenersAttached = false;
  };
}

// ── Scroll owner registry ─────────────────────────────────────────────────────

export function registerScrollOwner(id: string, element: HTMLElement): void {
  owners.set(id, { id, element, savedScrollTop: 0 });
}

export function unregisterScrollOwner(id: string): void {
  owners.delete(id);
}

export function setActiveScrollOwner(id: string): void {
  // Save current owner's scroll position before handing off.
  const current = owners.get(activeLayer);
  if (current) {
    current.savedScrollTop = current.element.scrollTop;
  }
  document.documentElement.style.setProperty('--qlpa-scroll-owner', id);
}

export function restoreScrollPosition(id: string): void {
  const entry = owners.get(id);
  if (entry) {
    entry.element.scrollTop = entry.savedScrollTop;
  }
}

// ── Body scroll lock ──────────────────────────────────────────────────────────
//
// iOS Safari bypasses overflow:hidden on <html>/<body> and rubber-bands anyway.
// The only reliable iOS fix is position:fixed + top:-scrollYpx on <body>.
// We also set html overflow:hidden to stop the <html> element itself from
// bouncing.
//
// Depth-counted so nested callers (sheet inside modal) don't double-restore.

export function lockBodyScroll(layer: ScrollLayer): void {
  if (typeof window === 'undefined') return;

  bodyLockDepth++;
  activeLayer = layer;

  if (bodyLockDepth > 1) {
    // Already locked — just update the active layer token.
    document.documentElement.style.setProperty('--qlpa-scroll-owner', layer);
    return;
  }

  savedBodyScrollY = window.scrollY;

  const body = document.body;
  const html = document.documentElement;

  savedBodyStyles = {
    position: body.style.position,
    top:      body.style.top,
    width:    body.style.width,
    overflow: body.style.overflow,
  };
  savedHtmlOverflow = html.style.overflow;

  body.style.position = 'fixed';
  body.style.top      = `-${savedBodyScrollY}px`;
  body.style.width    = '100%';
  body.style.overflow = 'hidden';
  html.style.overflow = 'hidden';

  html.style.setProperty('--qlpa-scroll-owner', layer);
}

export function unlockBodyScroll(layer: ScrollLayer): void {
  if (typeof window === 'undefined') return;

  bodyLockDepth = Math.max(0, bodyLockDepth - 1);

  if (bodyLockDepth > 0) {
    // Still locked by another caller — only downgrade the layer token.
    document.documentElement.style.setProperty('--qlpa-scroll-owner', 'page');
    return;
  }

  activeLayer = 'page';

  const body = document.body;
  const html = document.documentElement;

  if (savedBodyStyles) {
    body.style.position = savedBodyStyles.position;
    body.style.top      = savedBodyStyles.top;
    body.style.width    = savedBodyStyles.width;
    body.style.overflow = savedBodyStyles.overflow;
    savedBodyStyles = null;
  }

  html.style.overflow = savedHtmlOverflow;
  savedHtmlOverflow = '';

  // Restore the page scroll position that was captured at lock time.
  window.scrollTo(0, savedBodyScrollY);

  html.style.removeProperty('--qlpa-scroll-owner');
}

export function getActiveLayer(): ScrollLayer {
  return activeLayer;
}

// ── Convenience hook-friendly re-export ──────────────────────────────────────

export const scrollOrchestrator = {
  lockBodyScroll,
  unlockBodyScroll,
  registerScrollOwner,
  unregisterScrollOwner,
  setActiveScrollOwner,
  restoreScrollPosition,
  attachVisualViewportListeners,
  updateVisualViewportHeight,
  getActiveLayer,
} as const;
