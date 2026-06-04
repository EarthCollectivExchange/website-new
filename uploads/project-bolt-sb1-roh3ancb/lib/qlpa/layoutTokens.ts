// ─── QLPA Layout Tokens ───────────────────────────────────────────────────────
//
// Central exported constants that mirror the CSS custom properties used
// throughout the app. When a CSS variable value changes, update both here
// and in globals.css / tailwind.config.ts.
//
// Usage in TypeScript:
//   element.style.setProperty(CSS_VARS.bottomNavH, '56px');
//
// Usage in inline styles:
//   style={{ height: `var(${CSS_VARS.bottomNavH}, ${LAYOUT.bottomNavH}px)` }}

// ─── CSS variable names ───────────────────────────────────────────────────────

export const CSS_VARS = {
  // Dynamic — written at runtime by scrollOrchestrator / component
  vvh:          '--qlpa-vvh',
  sheetMaxH:    '--qlpa-sheet-max-h',
  composerH:    '--qlpa-composer-h',
  // bottomNavH maps to the canonical CSS token already defined in globals.css
  bottomNavH:   '--qlpa-mobile-nav-h',
  scrollOwner:  '--qlpa-scroll-owner',

  // Static — written once from LAYOUT constants
  touchTarget:  '--qlpa-touch-target',
  safeTop:      '--qlpa-safe-top',
  safeBottom:   '--qlpa-safe-bottom',
} as const;

// ─── Static layout constants (px) ────────────────────────────────────────────
// These are the baseline values before any runtime adjustment.
// IMPORTANT: bottomNavH must match --qlpa-mobile-nav-h in globals.css (72px).

export const LAYOUT = {
  bottomNavH:    72,    // mobile bottom nav height — matches --qlpa-mobile-nav-h: 4.5rem
  composerH:     72,    // message composer bar height — matches --qlpa-bottom-bar-h: 4.5rem
  touchTarget:   44,    // minimum touch target per HIG / WCAG
  sheetHandleH:  36,    // drag handle + padding
  sheetMaxRatio: 0.82,  // max sheet height as fraction of viewport
} as const;

// ─── Phi spacing scale (matches tailwind phi-* utilities) ─────────────────────
// Fibonacci-derived spacing: 3, 6, 9, 13, 21, 34, 55, 89 px

export const PHI_SPACE = {
  1: 3,
  2: 6,
  3: 9,
  4: 13,
  5: 21,
  6: 34,
  7: 55,
  8: 89,
} as const;

// ─── QLPA named spacing constants (px) ───────────────────────────────────────
// Canonical Fibonacci px values as named exports for use in inline styles and
// computed layout. Values mirror PHI_SPACE but with explicit numeric names.

export const QLPA_SPACE_8  =  8 as const;
export const QLPA_SPACE_13 = 13 as const;
export const QLPA_SPACE_21 = 21 as const;
export const QLPA_SPACE_34 = 34 as const;
export const QLPA_SPACE_55 = 55 as const;
export const QLPA_SPACE_89 = 89 as const;

// ─── QLPA panel / card height ratios ─────────────────────────────────────────
// Viewport-fraction caps for the two panel contexts:
//   QLPA_PANEL_MAX_H_RATIO  — tall side-drawers and modal sheets (82 % = Pass 128)
//   QLPA_ROOT_CARD_MAX_H_RATIO — compact centred Φ-card on landing (77 % = Pass 133)
//   QLPA_ROOT_CARD_WIDTH_RATIO — max-width for centred card (90 vw = Pass 133)

export const QLPA_PANEL_MAX_H_RATIO      = 0.82 as const;
export const QLPA_ROOT_CARD_MAX_H_RATIO  = 0.77 as const;
export const QLPA_ROOT_CARD_WIDTH_RATIO  = 0.90 as const;

// ─── Safe area helpers ────────────────────────────────────────────────────────
// CSS env() expressions for safe area insets.

export const SAFE_AREA = {
  top:    'env(safe-area-inset-top, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left:   'env(safe-area-inset-left, 0px)',
  right:  'env(safe-area-inset-right, 0px)',
} as const;

// ─── Sheet height expression ──────────────────────────────────────────────────
// Single expression used by MobileSheet and any component that needs to
// know the sheet height budget without importing the component.

export const SHEET_MAX_H_EXPR =
  `calc(var(${CSS_VARS.vvh}, 100dvh) - ${SAFE_AREA.top} - 1rem)` as const;

// ─── Z-index hierarchy ────────────────────────────────────────────────────────
// Single source of truth. Must stay in sync with QLPA_Z in qlpaSettings.ts.

export const Z = {
  page:        0,
  content:    10,
  nav:        30,
  fab:        30,
  backdrop:   48,
  sheet:      50,
  modal:      60,
  toast:      70,
} as const;
