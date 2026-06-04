// ─── QLPA App Orchestrator ────────────────────────────────────────────────────
//
// Central app state definitions for the QLPA architecture.
// This module owns type-level contracts for every dimension of runtime state.
// Actual state storage lives in the component/context layer — this file defines
// the shapes and permitted values only.

import type { ActiveOverlay } from '@/lib/messaging/qlpaSettings';
import type { ScrollLayer } from '@/lib/foundation/scrollOrchestrator';
import type { HumanModeKey } from '@/lib/foundation/modes';
import type { InterfaceDepth } from './languageProtocol';

export type { ScrollLayer };

// ─── View layer ───────────────────────────────────────────────────────────────
// Which top-level screen the user is on.

export type ActiveView =
  | 'landing'
  | 'onboarding'
  | 'conversation-list'
  | 'conversation'
  | 'contacts'
  | 'trust'
  | 'settings'
  | 'auth';

// ─── Active sheet ─────────────────────────────────────────────────────────────
// Re-exports ActiveOverlay under the orchestrator namespace.
// Panels rendered inside MobileSheet use these identifiers.

export type { ActiveOverlay };

export type ActiveSheet = ActiveOverlay;

// InterfaceDepth is defined in languageProtocol.ts and re-exported from the
// barrel index. Re-exported here so AppState can reference it cleanly.
export type { InterfaceDepth };

// ─── App mode ─────────────────────────────────────────────────────────────────
// Determines storage and relay behaviour.

export type AppMode =
  | 'local_first'      // all data stays on device (default, privacy-maximising)
  | 'relay_ready'      // device-first, relay available for delivery when online
  | 'sovereign_relay'; // user controls relay destination — advanced

// ─── Device runtime class ─────────────────────────────────────────────────────
// Resolved once at startup and treated as immutable during a session.

export interface DeviceRuntime {
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isBrave: boolean;
  isPWA: boolean;
  isTouchDevice: boolean;
  prefersReducedMotion: boolean;
  hasSafeAreaSupport: boolean;
  visualViewportHeight: number;
}

// ─── Canonical app state snapshot ────────────────────────────────────────────
// A read-only snapshot of the runtime state at any moment.
// Components should never mutate this directly — they dispatch actions.

export interface AppState {
  activeView: ActiveView;
  activeSheet: ActiveSheet;
  activeScrollOwner: ScrollLayer;
  interfaceDepth: InterfaceDepth;
  humanMode: HumanModeKey;
  language: string;
  selectedConversationId: string | null;
  deviceRuntime: DeviceRuntime;
  appMode: AppMode;
}

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_APP_STATE: AppState = {
  activeView:             'conversation-list',
  activeSheet:            null,
  activeScrollOwner:      'page',
  interfaceDepth:         'simple',
  humanMode:              'calm',
  language:               'en',
  selectedConversationId: null,
  deviceRuntime: {
    isIOS:                  false,
    isAndroid:              false,
    isSafari:               false,
    isBrave:                false,
    isPWA:                  false,
    isTouchDevice:          false,
    prefersReducedMotion:   false,
    hasSafeAreaSupport:     false,
    visualViewportHeight:   0,
  },
  appMode: 'local_first',
};

// ─── Sheet open/close helpers ─────────────────────────────────────────────────
// Used by ConversationView and any component that opens a sheet.
// They enforce the invariant that at most one sheet is open at a time.

export function isSheetOpen(state: Pick<AppState, 'activeSheet'>): boolean {
  return state.activeSheet !== null;
}

export function openSheet(
  state: Pick<AppState, 'activeSheet'>,
  sheet: NonNullable<ActiveSheet>
): Pick<AppState, 'activeSheet'> {
  return { activeSheet: sheet };
}

export function closeSheet(): Pick<AppState, 'activeSheet'> {
  return { activeSheet: null };
}

// ─── activeOverlay → ActiveSheet adapter ─────────────────────────────────────
// ConversationView uses the local name `activeOverlay: ActiveOverlay`.
// This adapter provides a typed bridge to the canonical QLPA name.
// Since ActiveSheet = ActiveOverlay, this is an identity function with
// explicit typing to make the architectural intent clear.

export function toQlpaActiveSheet(activeOverlay: ActiveOverlay): ActiveSheet {
  return activeOverlay;
}
