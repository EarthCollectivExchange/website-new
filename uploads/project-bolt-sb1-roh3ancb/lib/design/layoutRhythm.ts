/**
 * Layout Rhythm
 * Spacing tokens, panel gaps, card padding, and layout recommendations.
 * All values derive from the Fibonacci scale and Phi ratios.
 *
 * Use these constants rather than hardcoding px values in components.
 */

import { FIBONACCI } from './fibonacciScale';
import { MAJOR_RATIO, MINOR_RATIO } from './phiTokens';

// ─── Base spacing unit ────────────────────────────────────────────────────────
// 8px = 2 Tailwind units = 1 grid step
export const SPACING_BASE = 8;

// ─── Spacing tokens (px) ─────────────────────────────────────────────────────
export const SPACING = {
  hairline:  1,
  micro:     FIBONACCI.f3,   // 3px
  xs:        FIBONACCI.f5,   // 5px  → use p-1 (4px) or p-1.5 (6px)
  sm:        FIBONACCI.f8,   // 8px  → use p-2
  md:        FIBONACCI.f13,  // 13px → use p-3 (12px)
  lg:        FIBONACCI.f21,  // 21px → use p-5 (20px)
  xl:        FIBONACCI.f34,  // 34px → use p-8 (32px)
  xxl:       FIBONACCI.f55,  // 55px → use p-14 (56px)
  section:   FIBONACCI.f89,  // 89px → major section gap
} as const;

// ─── Panel gap tokens ─────────────────────────────────────────────────────────
export const PANEL_GAPS = {
  tight:      FIBONACCI.f8,   // 8px  — dense dev panels
  normal:     FIBONACCI.f13,  // 13px — standard panel gap
  relaxed:    FIBONACCI.f21,  // 21px — comfortable panel gap (simple view)
  spacious:   FIBONACCI.f34,  // 34px — care mode generous spacing
} as const;

// ─── Card padding tokens ──────────────────────────────────────────────────────
export const CARD_PADDING = {
  compact:    { x: FIBONACCI.f13, y: FIBONACCI.f8  },   // 13/8 — dense cards
  normal:     { x: FIBONACCI.f21, y: FIBONACCI.f13 },   // 21/13 — default cards
  comfortable:{ x: FIBONACCI.f21, y: FIBONACCI.f21 },   // 21/21 — calm/care mode
  spacious:   { x: FIBONACCI.f34, y: FIBONACCI.f21 },   // 34/21 — feature cards
} as const;

// ─── Sidebar / content ratio ──────────────────────────────────────────────────
// At 1200px viewport, the sidebar takes the minor ratio and content takes major.
export const LAYOUT_RATIOS = {
  sidebarMinor:   MINOR_RATIO,  // 38.2% — conversation list sidebar
  contentMajor:   MAJOR_RATIO,  // 61.8% — main conversation view
  sidebarPxMin:   320,          // never narrower than 320px on desktop
  sidebarPxMax:   420,          // never wider than 420px on desktop
} as const;

// ─── Mobile rhythm ────────────────────────────────────────────────────────────
export const MOBILE = {
  minViewportWidth:  320,
  safeAreaBottom:    FIBONACCI.f34,  // 34px — above bottom nav
  bottomNavHeight:   FIBONACCI.f55,  // 55px
  headerHeight:      FIBONACCI.f55,  // 55px
  composerMinHeight: FIBONACCI.f55,  // 55px
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const BORDER_RADIUS = {
  sm:    FIBONACCI.f5,   // 5px  — chips, badges
  md:    FIBONACCI.f8,   // 8px  — inputs
  lg:    FIBONACCI.f13,  // 13px — cards
  xl:    FIBONACCI.f21,  // 21px — panels
  full:  9999,           // fully rounded
} as const;
