'use client';

import { STORAGE_KEYS } from '@/lib/foundation/appConstants';

// ─── App Mode ─────────────────────────────────────────────────────────────────

export type AppMode = 'local_first' | 'demo' | 'network_future';

// ─── Interface Depth ──────────────────────────────────────────────────────────

export type InterfaceDepth = 'simple' | 'advanced' | 'developer';

export const INTERFACE_DEPTHS: {
  key: InterfaceDepth;
  labelKey: string;
  descriptionKey: string;
  badge: string;
  badgeClass: string;
}[] = [
  {
    key: 'simple',
    labelKey: 'modes.simple',
    descriptionKey: 'modes.simpleDesc',
    badge: 'Simple',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-700/40 dark:text-emerald-400',
  },
  {
    key: 'advanced',
    labelKey: 'modes.advanced',
    descriptionKey: 'modes.advancedDesc',
    badge: 'Adv',
    badgeClass: 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/30 dark:border-sky-700/40 dark:text-sky-400',
  },
  {
    key: 'developer',
    labelKey: 'modes.developer',
    descriptionKey: 'modes.developerDesc',
    badge: 'Dev',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-700/40 dark:text-amber-400',
  },
];

// ─── Stats Mode ───────────────────────────────────────────────────────────────

export type StatsModePref = 'off' | 'light' | 'complete';

// ─── Human Mode ───────────────────────────────────────────────────────────────

// QLPA note: 'emergency' key retained for backwards-compat with stored prefs.
// New modes: 'care', 'creator', 'shield'. Shield replaces emergency in UX.
export type HumanModeKey = 'calm' | 'sovereign' | 'focus' | 'care' | 'creator' | 'shield' | 'emergency';

export interface HumanMode {
  key: HumanModeKey;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  defaultStorageMode: 'local_only' | 'encrypted_relay' | 'encrypted_backup';
  spacingDensity: 'comfortable' | 'compact' | 'spacious';
  notificationTone: 'gentle' | 'standard' | 'silent' | 'urgent';
  visibleFeatures: {
    voiceMemo: boolean;
    fileTransfer: boolean;
    ritualNote: boolean;
    intentionMirror: boolean;
    retentionTimer: boolean;
    emergencyBroadcast: boolean;
  };
  panelPriority: Array<'overview' | 'privacy' | 'people' | 'files' | 'settings'>;
  quickActions: Array<'message' | 'call' | 'file' | 'voice' | 'ritual' | 'export' | 'broadcast'>;
  accentHue: string;
}

export const HUMAN_MODES: Record<HumanModeKey, HumanMode> = {
  calm: {
    key: 'calm',
    labelKey: 'modes.calm',
    descriptionKey: 'modes.calmDesc',
    icon: '◍',
    defaultStorageMode: 'local_only',
    spacingDensity: 'comfortable',
    notificationTone: 'gentle',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: false,
      ritualNote: true,
      intentionMirror: true,
      retentionTimer: false,
      emergencyBroadcast: false,
    },
    panelPriority: ['overview', 'people', 'files', 'privacy', 'settings'],
    quickActions: ['message', 'voice', 'ritual'],
    accentHue: 'emerald',
  },
  sovereign: {
    key: 'sovereign',
    labelKey: 'modes.sovereign',
    descriptionKey: 'modes.sovereignDesc',
    icon: '◈',
    defaultStorageMode: 'local_only',
    spacingDensity: 'comfortable',
    notificationTone: 'standard',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: true,
      ritualNote: true,
      intentionMirror: true,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['privacy', 'overview', 'people', 'files', 'settings'],
    quickActions: ['message', 'file', 'voice', 'export'],
    accentHue: 'sky',
  },
  focus: {
    key: 'focus',
    labelKey: 'modes.focus',
    descriptionKey: 'modes.focusDesc',
    icon: '◎',
    defaultStorageMode: 'encrypted_relay',
    spacingDensity: 'compact',
    notificationTone: 'silent',
    visibleFeatures: {
      voiceMemo: false,
      fileTransfer: false,
      ritualNote: false,
      intentionMirror: false,
      retentionTimer: false,
      emergencyBroadcast: false,
    },
    panelPriority: ['overview', 'people', 'settings', 'privacy', 'files'],
    quickActions: ['message'],
    accentHue: 'slate',
  },
  care: {
    key: 'care',
    labelKey: 'modes.care',
    descriptionKey: 'modes.careDesc',
    icon: '◉',
    defaultStorageMode: 'local_only',
    spacingDensity: 'spacious',
    notificationTone: 'gentle',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: false,
      ritualNote: true,
      intentionMirror: true,
      retentionTimer: false,
      emergencyBroadcast: false,
    },
    panelPriority: ['people', 'overview', 'files', 'privacy', 'settings'],
    quickActions: ['message', 'voice', 'ritual'],
    accentHue: 'rose',
  },
  creator: {
    key: 'creator',
    labelKey: 'modes.creator',
    descriptionKey: 'modes.creatorDesc',
    icon: '◆',
    defaultStorageMode: 'encrypted_relay',
    spacingDensity: 'comfortable',
    notificationTone: 'standard',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: true,
      ritualNote: true,
      intentionMirror: false,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['files', 'overview', 'people', 'privacy', 'settings'],
    quickActions: ['message', 'file', 'voice', 'ritual', 'export'],
    accentHue: 'amber',
  },
  shield: {
    key: 'shield',
    labelKey: 'modes.shield',
    descriptionKey: 'modes.shieldDesc',
    icon: '◇',
    defaultStorageMode: 'local_only',
    spacingDensity: 'compact',
    notificationTone: 'silent',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: false,
      ritualNote: false,
      intentionMirror: false,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['privacy', 'overview', 'people', 'settings', 'files'],
    quickActions: ['message', 'voice'],
    accentHue: 'teal',
  },
  // Legacy key — kept for backwards compat with stored preferences.
  // Functionally identical to 'shield'. TODO: migrate stored 'emergency' → 'shield'.
  emergency: {
    key: 'emergency',
    labelKey: 'modes.shield',
    descriptionKey: 'modes.shieldDesc',
    icon: '◇',
    defaultStorageMode: 'local_only',
    spacingDensity: 'compact',
    notificationTone: 'silent',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: false,
      ritualNote: false,
      intentionMirror: false,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['privacy', 'overview', 'people', 'settings', 'files'],
    quickActions: ['message', 'voice'],
    accentHue: 'teal',
  },
};

export const HUMAN_MODE_LIST: HumanMode[] = Object.values(HUMAN_MODES);

// ─── Persistence ──────────────────────────────────────────────────────────────

const LEGACY_VIEW_KEY = 'earthos.view_level';

export function loadHumanMode(): HumanModeKey {
  if (typeof window === 'undefined') return 'calm';
  const stored = localStorage.getItem(STORAGE_KEYS.humanMode) as HumanModeKey | null;
  if (stored && stored in HUMAN_MODES) return stored;
  return 'calm';
}

export function saveHumanMode(mode: HumanModeKey): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.humanMode, mode);
}

export function loadInterfaceDepth(): InterfaceDepth {
  if (typeof window === 'undefined') return 'simple';
  const stored = localStorage.getItem(STORAGE_KEYS.interfaceDepth) as InterfaceDepth | null;
  if (stored === 'simple' || stored === 'advanced' || stored === 'developer') return stored;
  // Migrate from legacy view_level key
  const legacy = localStorage.getItem(LEGACY_VIEW_KEY) as string | null;
  if (legacy === 'developer') return 'developer';
  if (legacy === 'advanced') return 'advanced';
  return 'simple';
}

export function saveInterfaceDepth(depth: InterfaceDepth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.interfaceDepth, depth);
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function isAdvancedOrDev(depth: InterfaceDepth): boolean {
  return depth === 'advanced' || depth === 'developer';
}

export function isDeveloper(depth: InterfaceDepth): boolean {
  return depth === 'developer';
}

/** Map old ViewLevel values to new InterfaceDepth for backward compat */
export type ViewLevel = InterfaceDepth;
