/**
 * QLPA Settings Domain Model
 * Canonical types for all setting cards, overlays, and human modes in EarthOS.
 *
 * Color source of truth:
 *   - QLPA_MODE_COLORS  (lib/qlpa/tokens.ts) — inline RGBA values for JS-driven styling (ModeBar, etc.)
 *   - HUMAN_MODE_STYLES (this file)           — Tailwind class strings for class-driven components
 *   Both derive from the same semantic palette; QLPA_MODE_COLORS is the primary source.
 */

// Re-export so consumers have one import path for all mode color tokens
export { QLPA_MODE_COLORS } from '@/lib/qlpa/tokens';

// ─── Settings domains ─────────────────────────────────────────────────────────

export type QLPASettingsDomain =
  | 'identity'
  | 'mode'
  | 'privacy'
  | 'trust'
  | 'delivery'
  | 'storage'
  | 'members'
  | 'integrity'
  | 'interface'
  | 'developer';

// ─── Setting card shape ───────────────────────────────────────────────────────

export type QLPASettingStatus =
  | 'active'
  | 'ready'
  | 'waiting'
  | 'blocked'
  | 'local'
  | 'coming-soon';

export type QLPASettingVisibility = 'simple' | 'advanced' | 'developer';

export interface QLPASettingCard {
  id: string;
  domain: QLPASettingsDomain;
  title: string;
  description: string;
  status?: QLPASettingStatus;
  visibility: QLPASettingVisibility;
  danger?: boolean;
}

// ─── Active overlay controller ────────────────────────────────────────────────
// Only one overlay/panel/drawer/modal may be open at a time.

export type ActiveOverlay =
  | null
  | 'new-conversation'
  | 'conversation-settings'
  | 'mode-interface'
  | 'invite-member'
  | 'auto-clear'
  | 'trust'
  | 'privacy'
  | 'delivery'
  | 'consent'
  | 'members'
  | 'details'
  | 'integrity'
  | 'sovereignty'
  | 'retention';

// ─── Human mode color system ──────────────────────────────────────────────────
// Human modes use identity colors, NOT technical status colors.
// These are calm, grounded expressions of a person's interaction state.

export type HumanMode = 'calm' | 'focus' | 'care' | 'creator' | 'shield' | 'sovereign';

export interface HumanModeStyle {
  bg: string;       // Tailwind background
  border: string;   // Tailwind border
  text: string;     // Tailwind text color
  dot: string;      // Tailwind dot/icon color
  label: string;    // Display label
}

export const HUMAN_MODE_STYLES: Record<HumanMode, HumanModeStyle> = {
  calm:     { bg: 'bg-teal-500/8',    border: 'border-teal-500/22',   text: 'text-teal-300',    dot: 'bg-teal-400',    label: 'Calm' },
  focus:    { bg: 'bg-blue-600/8',    border: 'border-blue-600/22',   text: 'text-blue-300',    dot: 'bg-blue-400',    label: 'Focus' },
  care:     { bg: 'bg-rose-500/8',    border: 'border-rose-500/22',   text: 'text-rose-300',    dot: 'bg-rose-400',    label: 'Care' },
  creator:  { bg: 'bg-amber-500/8',   border: 'border-amber-500/22',  text: 'text-amber-300',   dot: 'bg-amber-400',   label: 'Creator' },
  shield:   { bg: 'bg-cyan-400/8',    border: 'border-cyan-400/22',   text: 'text-cyan-300',    dot: 'bg-cyan-400',    label: 'Shield' },
  sovereign:{ bg: 'bg-violet-500/8',  border: 'border-violet-500/22', text: 'text-violet-300',  dot: 'bg-violet-400',  label: 'Sovereign' },
};

// ─── Technical status color system ────────────────────────────────────────────
// Used for delivery state, encryption state, consent state — NOT human modes.

export interface StatusStyle {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

export const STATUS_STYLES: Record<QLPASettingStatus, StatusStyle> = {
  active:       { bg: 'bg-teal-500/10',  border: 'border-teal-500/25',  text: 'text-teal-300',   icon: 'text-teal-400' },
  ready:        { bg: 'bg-sky-500/10',   border: 'border-sky-500/25',   text: 'text-sky-300',    icon: 'text-sky-400' },
  waiting:      { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-300',  icon: 'text-amber-400' },
  blocked:      { bg: 'bg-red-500/10',   border: 'border-red-500/22',   text: 'text-red-300',    icon: 'text-red-400' },
  local:        { bg: 'bg-sky-500/8',    border: 'border-sky-500/20',   text: 'text-sky-300',    icon: 'text-sky-400' },
  'coming-soon':{ bg: 'bg-slate-500/8',  border: 'border-slate-500/20', text: 'text-slate-400',  icon: 'text-slate-500' },
};

// ─── Z-index hierarchy ────────────────────────────────────────────────────────

export const QLPA_Z = {
  shell:        10,   // Navigation shell
  screen:       20,   // Active conversation or app screen
  panel:        30,   // Right panel / drawer / mode panel
  modal:        40,   // Confirmation or destructive modal
  overlay:      50,   // Full-screen overlays
} as const;

// ─── Dark-safe color replacements ────────────────────────────────────────────
// Use these instead of light-mode Tailwind classes.
// bg-emerald-50  → bg-emerald-500/10, text-emerald-700 → text-emerald-300, border-emerald-200 → border-emerald-500/25
// bg-sky-50      → bg-sky-500/10,     text-sky-700     → text-sky-300,     border-sky-200     → border-sky-500/25
// bg-amber-50    → bg-amber-500/10,   text-amber-700   → text-amber-300,   border-amber-200   → border-amber-500/25
// bg-rose-50     → bg-rose-500/10,    text-rose-700    → text-rose-300,    border-rose-200    → border-rose-500/25
// bg-teal-50     → bg-teal-500/10,    text-teal-700    → text-teal-300,    border-teal-200    → border-teal-500/25
// bg-red-50      → bg-red-500/10,     text-red-700     → text-red-300,     border-red-200     → border-red-500/22

export const DARK_SAFE = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-300', icon: 'text-emerald-400' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/25',     text: 'text-sky-300',     icon: 'text-sky-400' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   text: 'text-amber-300',   icon: 'text-amber-400' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    text: 'text-rose-300',    icon: 'text-rose-400' },
  teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/25',    text: 'text-teal-300',    icon: 'text-teal-400' },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/22',     text: 'text-red-300',     icon: 'text-red-400' },
} as const;
