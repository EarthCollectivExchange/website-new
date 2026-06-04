// ─── QLPA Device Runtime ──────────────────────────────────────────────────────
//
// Detects the runtime environment once at startup.
// The result is immutable for the lifetime of the session.
// All detection is feature-based (not UA-string heuristic where avoidable).
//
// Call detectDeviceRuntime() once (e.g. in a top-level useEffect or layout)
// and store the result in context or module-level state.

import type { DeviceRuntime } from './appOrchestrator';

// ── UA helpers (used only where no feature-based alternative exists) ──────────

function ua(): string {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  // Feature-based: iOS exposes standalone via navigator.standalone.
  // Also check UA as fallback — iOS/iPadOS both report as iPhone/iPad/iPod
  // or as Macintosh with touch support (iPadOS desktop mode).
  const str = ua();
  const hasTouchPoints = navigator.maxTouchPoints > 1;
  const isMac = /Macintosh/.test(str);
  return /iPhone|iPad|iPod/.test(str) || (isMac && hasTouchPoints);
}

function isAndroidDevice(): boolean {
  return /Android/.test(ua());
}

function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const str = ua();
  // Safari includes "Safari" but not "Chrome" or "CriOS" or "FxiOS".
  return /Safari/.test(str) && !/Chrome|CriOS|FxiOS|Brave/.test(str);
}

function isBraveBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  // Brave exposes navigator.brave in modern versions.
  // UA alone is unreliable (Brave mimics Chrome UA).
  return 'brave' in navigator;
}

function isPWAStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari PWA
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

function hasTouchSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

function prefersReducedMotionQuery(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function detectSafeAreaSupport(): boolean {
  if (typeof window === 'undefined') return false;
  // Create a temporary element and check if env() resolves to a non-zero value.
  // This is a proxy — a device with safe-area support (notch, home indicator)
  // will return a non-empty computed value.
  try {
    const el = document.createElement('div');
    el.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    document.body.appendChild(el);
    const val = window.getComputedStyle(el).paddingBottom;
    document.body.removeChild(el);
    return val !== '0px' && val !== '';
  } catch {
    return false;
  }
}

function getVisualViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.visualViewport?.height ?? window.innerHeight;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function detectDeviceRuntime(): DeviceRuntime {
  return {
    isIOS:                isIOSDevice(),
    isAndroid:            isAndroidDevice(),
    isSafari:             isSafariBrowser(),
    isBrave:              isBraveBrowser(),
    isPWA:                isPWAStandalone(),
    isTouchDevice:        hasTouchSupport(),
    prefersReducedMotion: prefersReducedMotionQuery(),
    hasSafeAreaSupport:   detectSafeAreaSupport(),
    visualViewportHeight: getVisualViewportHeight(),
  };
}

// ── Reactive listener (optional) ──────────────────────────────────────────────
// Call this when you need to stay in sync with viewport changes (keyboard open).
// Returns a cleanup function.

export function watchVisualViewportHeight(
  onChange: (height: number) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const vv = window.visualViewport;
  function handle() {
    onChange(vv?.height ?? window.innerHeight);
  }
  vv?.addEventListener('resize', handle);
  vv?.addEventListener('scroll', handle);
  window.addEventListener('resize', handle);
  return () => {
    vv?.removeEventListener('resize', handle);
    vv?.removeEventListener('scroll', handle);
    window.removeEventListener('resize', handle);
  };
}
