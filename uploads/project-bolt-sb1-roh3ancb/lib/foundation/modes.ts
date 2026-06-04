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
    badgeClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  },
  {
    key: 'advanced',
    labelKey: 'modes.advanced',
    descriptionKey: 'modes.advancedDesc',
    badge: 'Adv',
    badgeClass: 'bg-sky-500/10 border-sky-500/25 text-sky-300',
  },
  {
    key: 'developer',
    labelKey: 'modes.developer',
    descriptionKey: 'modes.developerDesc',
    badge: 'Dev',
    badgeClass: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
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

  // ── QLPA Universal Mode Protocol ──────────────────────────────────────────
  // Each mode has a single universal function (a verb) and a short description
  // that appears in the ModeBar card and Settings panel.
  universalFunction: string;       // single verb: regulate, relate, concentrate, create, protect, command
  shortDescription: string;        // one phrase shown in the mode card (plain language, no overclaiming)
  composerBehavior: 'minimal' | 'standard' | 'expressive';  // controls tool visibility
  protectionLevel: 'standard' | 'elevated' | 'maximum';     // informs trust/consent UI emphasis

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

  // ── Right-panel defaults ───────────────────────────────────────────────────
  // Which panel to open by default when entering a conversation in this mode.
  // null = don't open any panel automatically.
  defaultRightPanel: 'members' | 'sovereignty' | 'privacy' | 'delivery' | 'consent' | 'retention' | null;
  rightPanelPriority: Array<'members' | 'details' | 'sovereignty' | 'privacy' | 'delivery' | 'consent' | 'retention'>;
}

export const HUMAN_MODES: Record<HumanModeKey, HumanMode> = {

  // ── Calm — regulate ───────────────────────────────────────────────────────
  calm: {
    key: 'calm',
    labelKey: 'modes.calm',
    descriptionKey: 'modes.calmDesc',
    icon: '◍',
    universalFunction: 'Regulate',
    shortDescription: 'Gentle, grounded communication. Minimal distractions.',
    composerBehavior: 'minimal',
    protectionLevel: 'standard',
    defaultStorageMode: 'local_only',
    spacingDensity: 'comfortable',
    notificationTone: 'gentle',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: false,
      ritualNote: true,
      intentionMirror: true,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['overview', 'people', 'privacy', 'settings', 'files'],
    quickActions: ['message', 'voice', 'ritual'],
    accentHue: 'emerald',
    defaultRightPanel: null,
    rightPanelPriority: ['members', 'details', 'privacy', 'consent', 'delivery', 'retention', 'sovereignty'],
  },

  // ── Care — relate ─────────────────────────────────────────────────────────
  care: {
    key: 'care',
    labelKey: 'modes.care',
    descriptionKey: 'modes.careDesc',
    icon: '◉',
    universalFunction: 'Relate',
    shortDescription: 'Warm, human presence. Voice notes and ritual tools open.',
    composerBehavior: 'standard',
    protectionLevel: 'standard',
    defaultStorageMode: 'local_only',
    spacingDensity: 'spacious',
    notificationTone: 'gentle',
    visibleFeatures: {
      voiceMemo: true,
      fileTransfer: false,
      ritualNote: true,
      intentionMirror: true,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['people', 'overview', 'privacy', 'settings', 'files'],
    quickActions: ['message', 'voice', 'ritual'],
    accentHue: 'rose',
    defaultRightPanel: 'members',
    rightPanelPriority: ['members', 'details', 'consent', 'privacy', 'delivery', 'retention', 'sovereignty'],
  },

  // ── Focus — concentrate ───────────────────────────────────────────────────
  focus: {
    key: 'focus',
    labelKey: 'modes.focus',
    descriptionKey: 'modes.focusDesc',
    icon: '◎',
    universalFunction: 'Concentrate',
    shortDescription: 'Message only. All other tools hidden to reduce noise.',
    composerBehavior: 'minimal',
    protectionLevel: 'standard',
    defaultStorageMode: 'local_only',
    spacingDensity: 'compact',
    notificationTone: 'silent',
    visibleFeatures: {
      voiceMemo: false,
      fileTransfer: false,
      ritualNote: false,
      intentionMirror: false,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['overview', 'people', 'settings', 'privacy', 'files'],
    quickActions: ['message'],
    accentHue: 'slate',
    defaultRightPanel: null,
    rightPanelPriority: ['members', 'details', 'privacy', 'delivery', 'consent', 'retention', 'sovereignty'],
  },

  // ── Creator — create ──────────────────────────────────────────────────────
  creator: {
    key: 'creator',
    labelKey: 'modes.creator',
    descriptionKey: 'modes.creatorDesc',
    icon: '◆',
    universalFunction: 'Create',
    shortDescription: 'Full expressive toolkit open. Files, voice, and ritual notes.',
    composerBehavior: 'expressive',
    protectionLevel: 'standard',
    defaultStorageMode: 'local_only',
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
    defaultRightPanel: null,
    rightPanelPriority: ['members', 'details', 'delivery', 'consent', 'privacy', 'retention', 'sovereignty'],
  },

  // ── Shield — protect ──────────────────────────────────────────────────────
  shield: {
    key: 'shield',
    labelKey: 'modes.shield',
    descriptionKey: 'modes.shieldDesc',
    icon: '◇',
    universalFunction: 'Protect',
    shortDescription: 'Privacy and consent tools prioritised. Auto-clear visible.',
    composerBehavior: 'minimal',
    protectionLevel: 'maximum',
    defaultStorageMode: 'local_only',
    spacingDensity: 'compact',
    notificationTone: 'silent',
    visibleFeatures: {
      voiceMemo: false,
      fileTransfer: false,
      ritualNote: false,
      intentionMirror: false,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['privacy', 'overview', 'people', 'settings', 'files'],
    quickActions: ['message'],
    accentHue: 'teal',
    defaultRightPanel: 'sovereignty',
    rightPanelPriority: ['sovereignty', 'privacy', 'consent', 'retention', 'delivery', 'members', 'details'],
  },

  // ── Sovereign — command ───────────────────────────────────────────────────
  sovereign: {
    key: 'sovereign',
    labelKey: 'modes.sovereign',
    descriptionKey: 'modes.sovereignDesc',
    icon: '◈',
    universalFunction: 'Command',
    shortDescription: 'Full agency. All tools and data controls visible.',
    composerBehavior: 'expressive',
    protectionLevel: 'elevated',
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
    quickActions: ['message', 'file', 'voice', 'ritual', 'export'],
    accentHue: 'violet',
    defaultRightPanel: 'sovereignty',
    rightPanelPriority: ['sovereignty', 'privacy', 'consent', 'members', 'delivery', 'retention', 'details'],
  },

  // Legacy key — kept for backwards compat with stored preferences.
  // Functionally identical to shield. Migrate stored 'emergency' → 'shield'.
  emergency: {
    key: 'emergency',
    labelKey: 'modes.shield',
    descriptionKey: 'modes.shieldDesc',
    icon: '◇',
    universalFunction: 'Protect',
    shortDescription: 'Privacy and consent tools prioritised. Auto-clear visible.',
    composerBehavior: 'minimal',
    protectionLevel: 'maximum',
    defaultStorageMode: 'local_only',
    spacingDensity: 'compact',
    notificationTone: 'silent',
    visibleFeatures: {
      voiceMemo: false,
      fileTransfer: false,
      ritualNote: false,
      intentionMirror: false,
      retentionTimer: true,
      emergencyBroadcast: false,
    },
    panelPriority: ['privacy', 'overview', 'people', 'settings', 'files'],
    quickActions: ['message'],
    accentHue: 'teal',
    defaultRightPanel: 'sovereignty',
    rightPanelPriority: ['sovereignty', 'privacy', 'consent', 'retention', 'delivery', 'members', 'details'],
  },
};

// Canonical display order: regulate → relate → concentrate → create → protect → command
export const HUMAN_MODE_LIST: HumanMode[] = (
  ['calm', 'care', 'focus', 'creator', 'shield', 'sovereign'] as HumanModeKey[]
).map((k) => HUMAN_MODES[k]);

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
