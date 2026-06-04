'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  loadHumanMode, saveHumanMode,
  loadInterfaceDepth, saveInterfaceDepth,
  isAdvancedOrDev, isDeveloper,
  type HumanModeKey, type InterfaceDepth, type AppMode,
} from './modes';
import { STORAGE_KEYS, PREFERENCE_DEFAULTS } from '@/lib/foundation/appConstants';
import { loadStatsMode, saveStatsMode } from '@/lib/stats/statsStore';
import type { StatsMode } from '@/lib/stats/statsTypes';

// ─── Background Mode ──────────────────────────────────────────────────────────

export type BackgroundMode = 'earth_alive' | 'live_world_future';

function loadBackgroundMode(): BackgroundMode {
  if (typeof window === 'undefined') return 'earth_alive';
  const stored = localStorage.getItem(STORAGE_KEYS.backgroundMode);
  if (stored === 'earth_alive' || stored === 'live_world_future') return stored;
  return PREFERENCE_DEFAULTS.backgroundMode as BackgroundMode;
}

function saveBackgroundMode(mode: BackgroundMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.backgroundMode, mode);
}

// ─── App Mode ─────────────────────────────────────────────────────────────────

function loadAppMode(): AppMode {
  if (typeof window === 'undefined') return 'local_first';
  return (localStorage.getItem(STORAGE_KEYS.appMode) as AppMode) ?? 'local_first';
}

function saveAppMode(mode: AppMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.appMode, mode);
}

// ─── Boolean preferences ──────────────────────────────────────────────────────

function loadBoolPref(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === 'true';
}

function saveBoolPref(key: string, value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, String(value));
}

// ─── Context value interface ──────────────────────────────────────────────────

export interface PreferencesContextValue {
  // Core
  humanMode: HumanModeKey;
  setHumanMode: (mode: HumanModeKey) => void;
  interfaceDepth: InterfaceDepth;
  setInterfaceDepth: (depth: InterfaceDepth) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // Extended
  statsMode: StatsMode;
  setStatsMode: (mode: StatsMode) => void;
  backgroundMode: BackgroundMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  developerDiagnostics: boolean;
  setDeveloperDiagnostics: (value: boolean) => void;

  // Computed flags
  isAdvancedOrDev: boolean;
  isDeveloper: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [humanMode, setHumanModeState] = useState<HumanModeKey>(() => loadHumanMode());
  const [interfaceDepth, setInterfaceDepthState] = useState<InterfaceDepth>(() => loadInterfaceDepth());
  const [appMode, setAppModeState] = useState<AppMode>(() => loadAppMode());
  const [statsMode, setStatsModeState] = useState<StatsMode>(() => loadStatsMode());
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>(() => loadBackgroundMode());
  const [reducedMotion, setReducedMotionState] = useState<boolean>(
    () => loadBoolPref(STORAGE_KEYS.reducedMotion, PREFERENCE_DEFAULTS.reducedMotion),
  );
  const [compactMode, setCompactModeState] = useState<boolean>(
    () => loadBoolPref(STORAGE_KEYS.compactMode, PREFERENCE_DEFAULTS.compactMode),
  );
  const [developerDiagnostics, setDeveloperDiagnosticsState] = useState<boolean>(
    () => loadBoolPref(STORAGE_KEYS.developerDiagnostics, PREFERENCE_DEFAULTS.developerDiagnostics),
  );

  const setHumanMode = useCallback((mode: HumanModeKey) => {
    saveHumanMode(mode);
    setHumanModeState(mode);
  }, []);

  const setInterfaceDepth = useCallback((depth: InterfaceDepth) => {
    saveInterfaceDepth(depth);
    setInterfaceDepthState(depth);
  }, []);

  const setAppMode = useCallback((mode: AppMode) => {
    saveAppMode(mode);
    setAppModeState(mode);
  }, []);

  const setStatsMode = useCallback((mode: StatsMode) => {
    saveStatsMode(mode);
    setStatsModeState(mode);
  }, []);

  const setBackgroundMode = useCallback((mode: BackgroundMode) => {
    saveBackgroundMode(mode);
    setBackgroundModeState(mode);
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    saveBoolPref(STORAGE_KEYS.reducedMotion, value);
    setReducedMotionState(value);
  }, []);

  const setCompactMode = useCallback((value: boolean) => {
    saveBoolPref(STORAGE_KEYS.compactMode, value);
    setCompactModeState(value);
  }, []);

  const setDeveloperDiagnostics = useCallback((value: boolean) => {
    saveBoolPref(STORAGE_KEYS.developerDiagnostics, value);
    setDeveloperDiagnosticsState(value);
  }, []);

  return (
    <PreferencesContext.Provider value={{
      humanMode,
      setHumanMode,
      interfaceDepth,
      setInterfaceDepth,
      appMode,
      setAppMode,
      statsMode,
      setStatsMode,
      backgroundMode,
      setBackgroundMode,
      reducedMotion,
      setReducedMotion,
      compactMode,
      setCompactMode,
      developerDiagnostics,
      setDeveloperDiagnostics,
      isAdvancedOrDev: isAdvancedOrDev(interfaceDepth),
      isDeveloper: isDeveloper(interfaceDepth),
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
