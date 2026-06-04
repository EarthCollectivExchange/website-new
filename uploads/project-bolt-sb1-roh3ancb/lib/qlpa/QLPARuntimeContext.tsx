'use client';

// ─── QLPA Runtime Context ─────────────────────────────────────────────────────
//
// Provides the canonical QLPA runtime state to the component tree.
//
// Design rules:
//   - All browser APIs (localStorage, visualViewport, navigator) run in
//     useEffect only — never during SSR render.
//   - Initial state mirrors DEFAULT_APP_STATE (all-false, safe defaults).
//   - deviceRuntime is detected once after mount and treated as immutable
//     for the session lifetime.
//   - This context does NOT own preferences (humanMode, interfaceDepth, appMode)
//     — those live in PreferencesContext. It reads from preferences only to
//     build a complete AppState snapshot if needed.
//   - activeView, activeSheet, activeScrollOwner, selectedConversationId are
//     exposed here so any component can read and dispatch them via one import.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  DEFAULT_APP_STATE,
  type AppState,
  type ActiveView,
  type ActiveSheet,
  type AppMode,
} from './appOrchestrator';
import type { ScrollLayer } from '@/lib/foundation/scrollOrchestrator';
import type { DeviceRuntime } from './appOrchestrator';
import { detectDeviceRuntime, watchVisualViewportHeight } from './deviceRuntime';

// ─── Context value ────────────────────────────────────────────────────────────

export interface QLPARuntimeContextValue {
  // Device — detected once at mount, immutable for session
  deviceRuntime: DeviceRuntime;

  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Sheet (mobile overlay/panel — one at a time)
  activeSheet: ActiveSheet;
  setActiveSheet: (sheet: ActiveSheet) => void;

  // Scroll ownership
  activeScrollOwner: ScrollLayer;
  setActiveScrollOwner: (layer: ScrollLayer) => void;

  // Selection
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;

  // App mode (read-only here — mutations go through PreferencesContext)
  appMode: AppMode;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const QLPARuntimeContext = createContext<QLPARuntimeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function QLPARuntimeProvider({ children }: { children: ReactNode }) {
  // All initial values are safe SSR defaults from DEFAULT_APP_STATE.
  const [deviceRuntime, setDeviceRuntime] = useState<DeviceRuntime>(
    DEFAULT_APP_STATE.deviceRuntime,
  );
  const [activeView, setActiveView] = useState<ActiveView>(
    DEFAULT_APP_STATE.activeView,
  );
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(
    DEFAULT_APP_STATE.activeSheet,
  );
  const [activeScrollOwner, setActiveScrollOwner] = useState<ScrollLayer>(
    DEFAULT_APP_STATE.activeScrollOwner,
  );
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    DEFAULT_APP_STATE.selectedConversationId,
  );
  const [appMode] = useState<AppMode>(DEFAULT_APP_STATE.appMode);

  // Detect device once after first client render.
  // visualViewportHeight is kept live via the watcher.
  useEffect(() => {
    const initial = detectDeviceRuntime();
    setDeviceRuntime(initial);

    const cleanup = watchVisualViewportHeight((height) => {
      setDeviceRuntime((prev) => ({ ...prev, visualViewportHeight: height }));
    });

    return cleanup;
  }, []);

  const value: QLPARuntimeContextValue = {
    deviceRuntime,
    activeView,
    setActiveView: useCallback((v) => setActiveView(v), []),
    activeSheet,
    setActiveSheet: useCallback((s) => setActiveSheet(s), []),
    activeScrollOwner,
    setActiveScrollOwner: useCallback((l) => setActiveScrollOwner(l), []),
    selectedConversationId,
    setSelectedConversationId: useCallback((id) => setSelectedConversationId(id), []),
    appMode,
  };

  return (
    <QLPARuntimeContext.Provider value={value}>
      {children}
    </QLPARuntimeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQLPARuntime(): QLPARuntimeContextValue {
  const ctx = useContext(QLPARuntimeContext);
  if (!ctx) throw new Error('useQLPARuntime must be used within QLPARuntimeProvider');
  return ctx;
}

// ─── Convenience selector hooks ───────────────────────────────────────────────

export function useDeviceRuntime(): DeviceRuntime {
  return useQLPARuntime().deviceRuntime;
}

export function useActiveSheet(): [ActiveSheet, (s: ActiveSheet) => void] {
  const { activeSheet, setActiveSheet } = useQLPARuntime();
  return [activeSheet, setActiveSheet];
}
