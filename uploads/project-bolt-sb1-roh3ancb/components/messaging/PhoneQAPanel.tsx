'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Smartphone, RotateCcw, Copy, Check,
  CircleAlert as AlertCircle, Circle, ChevronDown, ChevronRight,
} from 'lucide-react';

// ─── Storage ──────────────────────────────────────────────────────────────────

const PHONE_QA_KEY = 'earthos.phoneQa.v1';

type CheckStatus = 'untested' | 'pass' | 'issue';

interface CheckItem {
  status: CheckStatus;
  note?: string;
}

interface PhoneQAState {
  deviceLabel: string;
  testRound: string;
  testerNote: string;
  lastUpdated: string;
  checks: Record<string, CheckItem>;
}

// ─── Section definitions ──────────────────────────────────────────────────────

interface SectionDef {
  id: string;
  title: string;
  items: Array<{ key: string; label: string }>;
}

const SECTIONS: SectionDef[] = [
  {
    id: 'launch',
    title: 'Launch & Landing',
    items: [
      { key: 'landingOpens',      label: 'Landing opens cleanly' },
      { key: 'orbRenders',        label: 'EarthOS orb and background render' },
      { key: 'continueLocal',     label: '"Continue without account" loads messaging' },
      { key: 'bottomNavVisible',  label: 'Bottom navigation fully visible' },
    ],
  },
  {
    id: 'convList',
    title: 'Conversation List',
    items: [
      { key: 'convListScrolls',     label: 'Conversation list scrolls' },
      { key: 'newCtaVisible',       label: 'New button visible' },
      { key: 'firstRunHint',        label: 'First-run hint appears when empty' },
      { key: 'noDuplicateConvs',    label: 'No duplicate seed conversations' },
      { key: 'filterChipsScroll',   label: 'Filter chips scroll horizontally' },
    ],
  },
  {
    id: 'createConv',
    title: 'Create Conversation',
    items: [
      { key: 'newConvDrawerOpens',  label: 'New conversation drawer opens' },
      { key: 'typeGridTappable',    label: 'Conversation type grid is tappable' },
      { key: 'nameStepRenders',     label: 'Name / intention step renders' },
      { key: 'sovereigntyStep',     label: 'Storage / sovereignty step renders' },
      { key: 'createClosesDrawer',  label: '"Create" closes drawer and adds conversation' },
    ],
  },
  {
    id: 'emptyJourney',
    title: 'Empty Conversation Journey',
    items: [
      { key: 'emptyJourneyClear',     label: 'Empty journey shows single Invite button' },
      { key: 'inviteMemberWorks',     label: 'Invite member works' },
      { key: 'sendTestMsgDisabled',   label: '"Send test message" disabled before invite' },
      { key: 'disabledHintShown',     label: 'Disabled state shows explanatory hint' },
      { key: 'sendTestMessageWorks',  label: 'Send test message works after invite' },
    ],
  },
  {
    id: 'composer',
    title: 'Message Composer',
    items: [
      { key: 'composerVisible',     label: 'Composer visible at bottom' },
      { key: 'composerSendsMsg',    label: 'Typing and sending works' },
      { key: 'attachMenuOpens',     label: 'Attachment menu opens' },
      { key: 'keyboardNoPush',      label: 'Keyboard does not push sheet off screen' },
    ],
  },
  {
    id: 'statusPills',
    title: 'Status Pills',
    items: [
      { key: 'protectedPillVisible', label: '"Protected" chip readable' },
      { key: 'readyPillVisible',     label: '"Ready" chip readable' },
      { key: 'allowedPillVisible',   label: '"Allowed" chip readable' },
      { key: 'noRawI18nKeys',        label: 'No raw i18n keys visible' },
    ],
  },
  {
    id: 'sheets',
    title: 'Mobile Sheets',
    items: [
      { key: 'protectedSheetOpens',    label: 'Protected sheet opens' },
      { key: 'readySheetOpens',        label: 'Ready sheet opens' },
      { key: 'allowedSheetOpens',      label: 'Allowed sheet opens' },
      { key: 'sheetHeightCorrect',     label: 'Sheets open at ~82% viewport height' },
      { key: 'closeXWorks',            label: 'Close / drag handle works' },
      { key: 'backdropCloses',         label: 'Backdrop tap closes sheet' },
      { key: 'sheetScrollsInternally', label: 'Sheet scrolls internally' },
      { key: 'backgroundStaysStill',   label: 'Background stays still while sheet open' },
      { key: 'noBlurOnContent',        label: 'Sheet content not blurred or dimmed' },
      { key: 'modePanelScrolls',       label: 'Mode panel scrolls' },
      { key: 'messageJourneyOpens',    label: 'Message journey opens' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [
      { key: 'settingsTabOpens',    label: 'Settings tab opens' },
      { key: 'settingsScrolls',     label: 'Settings page scrolls fully' },
      { key: 'languageSwitches',    label: 'Language selector works' },
      { key: 'clearDataWorks',      label: '"Clear all local data" resets to seed' },
    ],
  },
  {
    id: 'releaseMarker',
    title: 'Release Marker',
    items: [
      { key: 'preMvpBadgeVisible',   label: 'Pre-MVP badge visible in Settings' },
      { key: 'noSensitiveDataShown', label: 'No sensitive data shown in Simple mode' },
    ],
  },
  {
    id: 'exportReset',
    title: 'Export / Reset',
    items: [
      { key: 'exportJsonWorks',     label: 'Export data JSON works' },
      { key: 'resetLocalWorks',     label: 'Clear all local data works' },
      { key: 'qaReportCopies',      label: 'QA report copies to clipboard' },
    ],
  },
];

// Flat list of all items for iteration
const ALL_ITEMS: Array<{ key: string; label: string; sectionId: string; sectionTitle: string }> =
  SECTIONS.flatMap((s) => s.items.map((item) => ({ ...item, sectionId: s.id, sectionTitle: s.title })));

const DEFAULT_CHECKS: Record<string, CheckItem> = Object.fromEntries(
  ALL_ITEMS.map(({ key }) => [key, { status: 'untested' as CheckStatus, note: '' }])
);

const DEFAULT_STATE: PhoneQAState = {
  deviceLabel: '',
  testRound: '',
  testerNote: '',
  lastUpdated: '',
  checks: { ...DEFAULT_CHECKS },
};

function freshChecks(): Record<string, CheckItem> {
  return Object.fromEntries(
    ALL_ITEMS.map(({ key }) => [key, { status: 'untested' as CheckStatus, note: '' }])
  );
}

function loadQAState(): PhoneQAState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE, checks: freshChecks() };
  try {
    const raw = localStorage.getItem(PHONE_QA_KEY);
    if (!raw) return { ...DEFAULT_STATE, checks: freshChecks() };
    const parsed = JSON.parse(raw) as Partial<PhoneQAState>;
    const rawChecks = (parsed.checks ?? {}) as Record<string, CheckItem | boolean>;
    const migratedChecks: Record<string, CheckItem> = {};
    for (const key of Object.keys(DEFAULT_CHECKS)) {
      const entry = rawChecks[key];
      if (entry === undefined || entry === null) {
        migratedChecks[key] = { status: 'untested', note: '' };
      } else if (typeof entry === 'boolean') {
        migratedChecks[key] = { status: entry ? 'pass' : 'untested', note: '' };
      } else {
        migratedChecks[key] = { status: entry.status ?? 'untested', note: entry.note ?? '' };
      }
    }
    return {
      deviceLabel: parsed.deviceLabel ?? '',
      testRound: parsed.testRound ?? '',
      testerNote: parsed.testerNote ?? '',
      lastUpdated: parsed.lastUpdated ?? '',
      checks: migratedChecks,
    };
  } catch {
    return { ...DEFAULT_STATE, checks: freshChecks() };
  }
}

function saveQAState(state: PhoneQAState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PHONE_QA_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode, quota, permissions)
  }
}

// ─── Device info ──────────────────────────────────────────────────────────────

interface DeviceInfo {
  vw: number;
  vh: number;
  vvh: number | null;
  platform: string;
  bodyLocked: boolean;
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { vw: 0, vh: 0, vvh: null, platform: 'ssr', bodyLocked: false };
  }
  const vv = window.visualViewport;
  return {
    vw: window.innerWidth,
    vh: window.innerHeight,
    vvh: vv ? Math.round(vv.height) : null,
    platform: (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad'))
      ? 'iOS'
      : navigator.userAgent.includes('Android')
      ? 'Android'
      : 'Desktop',
    bodyLocked: document.body.style.position === 'fixed',
  };
}

// ─── Report generation (grouped by section) ───────────────────────────────────

function generateReport(state: PhoneQAState, deviceInfo: DeviceInfo | null, interfaceMode: string): string {
  const lines: string[] = [];
  lines.push('=== EarthOS Phone QA Report ===');
  lines.push(`Device: ${state.deviceLabel || '(not set)'}`);
  lines.push(`Round: ${state.testRound || '(not set)'}`);
  lines.push(`Timestamp: ${state.lastUpdated || new Date().toISOString()}`);
  if (deviceInfo) {
    lines.push(`Viewport: ${deviceInfo.vw}x${deviceInfo.vh}px  vvh: ${deviceInfo.vvh ?? 'n/a'}px  Platform: ${deviceInfo.platform}`);
    lines.push(`Body lock: ${deviceInfo.bodyLocked ? 'active' : 'off'}`);
  }
  lines.push(`App mode / interface view: ${interfaceMode}`);
  lines.push('');

  let totalPass = 0;
  let totalIssue = 0;
  let totalUntested = 0;

  for (const section of SECTIONS) {
    lines.push(`--- ${section.title} ---`);
    for (const { key, label } of section.items) {
      const item = state.checks[key];
      const statusStr = item?.status === 'pass' ? '[PASS]' : item?.status === 'issue' ? '[ISSUE]' : '[----]';
      if (item?.status === 'pass') totalPass++;
      else if (item?.status === 'issue') totalIssue++;
      else totalUntested++;
      lines.push(`  ${statusStr} ${label}`);
      if (item?.status === 'issue' && item.note) {
        lines.push(`         Note: ${item.note}`);
      }
    }
    lines.push('');
  }

  lines.push(`--- Summary ---`);
  lines.push(`Pass: ${totalPass}  Issue: ${totalIssue}  Untested: ${totalUntested}  Total: ${ALL_ITEMS.length}`);

  if (state.testerNote) {
    lines.push('');
    lines.push(`Tester note: ${state.testerNote}`);
  }
  lines.push('');
  lines.push('--- End of report ---');
  return lines.join('\n');
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function cycleStatus(current: CheckStatus): CheckStatus {
  if (current === 'untested') return 'pass';
  if (current === 'pass') return 'issue';
  return 'untested';
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass') {
    return (
      <span
        className="flex-shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center"
        style={{ background: 'hsl(152 58% 46% / 0.20)', border: '1px solid hsl(152 58% 46% / 0.50)' }}
      >
        <Check className="w-2.5 h-2.5" style={{ color: 'hsl(152 58% 62%)' }} />
      </span>
    );
  }
  if (status === 'issue') {
    return (
      <span
        className="flex-shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center"
        style={{ background: 'hsl(25 90% 50% / 0.15)', border: '1px solid hsl(25 90% 50% / 0.45)' }}
      >
        <AlertCircle className="w-2.5 h-2.5" style={{ color: 'hsl(25 90% 60%)' }} />
      </span>
    );
  }
  return (
    <span
      className="flex-shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center"
      style={{ background: 'transparent', border: '1px solid hsl(214 30% 32%)' }}
    >
      <Circle className="w-2 h-2 text-transparent" />
    </span>
  );
}

// ─── Pass 134: Go test flow checklist ────────────────────────────────────────

const GO_TEST_FLOW_ITEMS: Array<{ key: string; label: string }> = [
  { key: 'gtf1', label: 'Open Root orb panel' },
  { key: 'gtf2', label: 'Open Messaging orb panel' },
  { key: 'gtf3', label: 'Confirm New button visible' },
  { key: 'gtf4', label: 'Create Direct conversation' },
  { key: 'gtf5', label: 'Confirm Empty Journey at top' },
  { key: 'gtf6', label: 'Invite member' },
  { key: 'gtf7', label: 'Create local test message (always enabled)' },
  { key: 'gtf8', label: 'Send local test message' },
];

const FIRST_RUN_HINT_KEY = 'earthos.firstConversationCreated.v1';

// ─── Pass 134: Focus items (display-only list) ─────────────────────────────

const PASS134_FOCUS_ITEMS = [
  'Root/Messaging Φ-card fits without top masking',
  'New button is clear in Simple mode',
  'First-run hint appears before first conversation created',
  'Empty Journey starts at top of view',
  'Send test message stays disabled until member invited',
  'Mobile sheets scroll without background movement',
];

// ─── Device presets ───────────────────────────────────────────────────────────

const DEVICE_PRESETS = [
  { label: 'iPhone Safari',  value: 'iPhone Safari' },
  { label: 'iPhone Brave',   value: 'iPhone Brave' },
  { label: 'Samsung Brave',  value: 'Samsung Brave' },
  { label: 'Desktop Preview', value: 'Desktop Preview' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface PhoneQAPanelProps {
  interfaceMode: string;
  activeSheet?: string | null;
}

export function PhoneQAPanel({ interfaceMode, activeSheet }: PhoneQAPanelProps) {
  const [qaState, setQaState] = useState<PhoneQAState>({ ...DEFAULT_STATE, checks: freshChecks() });
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [copyFlash, setCopyFlash] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [fallbackText, setFallbackText] = useState('');
  const [resetFlash, setResetFlash] = useState<'idle' | 'statuses' | 'all'>('idle');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [nextFocusFlash, setNextFocusFlash] = useState(false);
  const [goTestFlow, setGoTestFlow] = useState<Record<string, CheckStatus>>(() =>
    Object.fromEntries(GO_TEST_FLOW_ITEMS.map(({ key }) => [key, 'untested' as CheckStatus]))
  );
  const [resetHintFlash, setResetHintFlash] = useState(false);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setQaState(loadQAState());
    setDeviceInfo(getDeviceInfo());
  }, []);

  const persistAndSet = useCallback((updater: (prev: PhoneQAState) => PhoneQAState) => {
    setQaState((prev) => {
      const next = updater(prev);
      next.lastUpdated = new Date().toISOString();
      saveQAState(next);
      return next;
    });
  }, []);

  const cycleCheck = useCallback((key: string) => {
    persistAndSet((prev) => {
      const current = prev.checks[key]?.status ?? 'untested';
      const next = cycleStatus(current);
      const updatedItem: CheckItem = { ...prev.checks[key], status: next };
      if (next === 'issue') {
        setExpandedIssue(key);
      } else if (expandedIssue === key) {
        setExpandedIssue(null);
      }
      return { ...prev, checks: { ...prev.checks, [key]: updatedItem } };
    });
  }, [expandedIssue, persistAndSet]);

  const setNote = useCallback((key: string, note: string) => {
    persistAndSet((prev) => ({
      ...prev,
      checks: { ...prev.checks, [key]: { ...prev.checks[key], note } },
    }));
  }, [persistAndSet]);

  const setMeta = useCallback((field: 'deviceLabel' | 'testRound' | 'testerNote', value: string) => {
    persistAndSet((prev) => ({ ...prev, [field]: value }));
  }, [persistAndSet]);

  const applyPreset = useCallback((value: string) => {
    persistAndSet((prev) => ({ ...prev, deviceLabel: value }));
  }, [persistAndSet]);

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resetStatuses = useCallback(() => {
    persistAndSet((prev) => ({ ...prev, checks: freshChecks() }));
    setExpandedIssue(null);
    setResetFlash('statuses');
    setTimeout(() => setResetFlash('idle'), 1400);
  }, [persistAndSet]);

  const resetAll = useCallback(() => {
    const fresh: PhoneQAState = { ...DEFAULT_STATE, checks: freshChecks() };
    fresh.lastUpdated = new Date().toISOString();
    saveQAState(fresh);
    setQaState(fresh);
    setExpandedIssue(null);
    setResetFlash('all');
    setTimeout(() => setResetFlash('idle'), 1400);
  }, []);

  const goNextUntested = useCallback(() => {
    const firstUntested = ALL_ITEMS.find(
      ({ key }) => (qaState.checks[key]?.status ?? 'untested') === 'untested'
    );
    if (!firstUntested) {
      setNextFocusFlash(true);
      setTimeout(() => setNextFocusFlash(false), 2000);
      return;
    }
    // Expand the section that contains this item
    const section = SECTIONS.find((s) => s.items.some((i) => i.key === firstUntested.key));
    if (section) {
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
    // Scroll to the item after a tick to allow section to expand
    setTimeout(() => {
      const el = itemRefs.current[firstUntested.key];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, [qaState.checks]);

  const copyReport = useCallback(() => {
    const report = generateReport(qaState, deviceInfo, interfaceMode);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(report).then(() => {
        setCopyFlash('copied');
        setTimeout(() => setCopyFlash('idle'), 1800);
      }).catch(() => {
        setFallbackText(report);
        setCopyFlash('fallback');
      });
    } else {
      setFallbackText(report);
      setCopyFlash('fallback');
      setTimeout(() => {
        if (fallbackRef.current) fallbackRef.current.select();
      }, 50);
    }
  }, [qaState, deviceInfo, interfaceMode]);

  const resetFirstRunHint = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FIRST_RUN_HINT_KEY);
    }
    setResetHintFlash(true);
    setTimeout(() => setResetHintFlash(false), 1400);
  }, []);

  const cycleGoTestFlow = useCallback((key: string) => {
    setGoTestFlow((prev) => ({ ...prev, [key]: cycleStatus(prev[key] ?? 'untested') }));
  }, []);

  // ─── Derived state ───────────────────────────────────────────────────────
  const totalPass    = ALL_ITEMS.filter(({ key }) => qaState.checks[key]?.status === 'pass').length;
  const totalIssue   = ALL_ITEMS.filter(({ key }) => qaState.checks[key]?.status === 'issue').length;
  const totalUntested = ALL_ITEMS.filter(({ key }) => (qaState.checks[key]?.status ?? 'untested') === 'untested').length;
  const total = ALL_ITEMS.length;
  const pct = total > 0 ? totalPass / total : 0;

  const firstUntestedItem = ALL_ITEMS.find(({ key }) => (qaState.checks[key]?.status ?? 'untested') === 'untested');

  const focusLine = totalUntested === 0 && totalIssue === 0
    ? 'All current phone checks pass locally.'
    : totalUntested === 0 && totalIssue > 0
    ? `Issues open: ${totalIssue}`
    : firstUntestedItem
    ? `Next: ${firstUntestedItem.sectionTitle} — ${firstUntestedItem.label}`
    : '';

  return (
    <div
      className="qlpa-glass-card overflow-hidden mb-2"
      data-qlpa-phone-qa-panel="true"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/50 flex items-center gap-2">
        <Smartphone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">Phone QA</p>
          <p className="text-[9px] text-muted-foreground">
            Local only — Developer mode only — no network
          </p>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/60 flex-shrink-0">
          {totalPass}P / {totalIssue}I / {totalUntested}U
        </span>
      </div>

      {/* Current test focus */}
      <div className="px-3 pt-2 pb-1.5 border-b border-border/30" data-qlpa-phone-qa-focus="true">
        <p className={`text-[10px] leading-snug ${
          totalUntested === 0 && totalIssue === 0
            ? 'text-emerald-400'
            : totalIssue > 0
            ? 'text-amber-400'
            : 'text-foreground/60'
        }`}>
          {focusLine}
        </p>
      </div>

      {/* Session metadata */}
      <div className="px-3 pt-2.5 pb-2 border-b border-border/30 space-y-1.5">
        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide font-semibold mb-1">
          Session
        </p>

        {/* Device presets */}
        <div className="flex flex-wrap gap-1 mb-1" data-qlpa-phone-qa-presets="true">
          {DEVICE_PRESETS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => applyPreset(value)}
              className={`text-[9px] px-1.5 py-0.5 rounded-md border transition-colors touch-manipulation ${
                qaState.deviceLabel === value
                  ? 'border-sky-500/50 text-sky-300 bg-sky-500/10'
                  : 'border-border/40 text-muted-foreground/60 hover:border-border/70 hover:text-muted-foreground/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-[9px] text-muted-foreground/50 block mb-0.5">Device label</label>
            <input
              type="text"
              value={qaState.deviceLabel}
              onChange={(e) => setMeta('deviceLabel', e.target.value)}
              placeholder="e.g. iPhone 15 Safari"
              className="w-full bg-transparent border border-border/40 rounded-lg px-1.5 py-1
                text-[10px] text-foreground placeholder:text-muted-foreground/30
                focus:outline-none focus:border-border/70"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground/50 block mb-0.5">Test round</label>
            <input
              type="text"
              value={qaState.testRound}
              onChange={(e) => setMeta('testRound', e.target.value)}
              placeholder="e.g. Pass 132"
              className="w-full bg-transparent border border-border/40 rounded-lg px-1.5 py-1
                text-[10px] text-foreground placeholder:text-muted-foreground/30
                focus:outline-none focus:border-border/70"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground/50 block mb-0.5">Tester note</label>
          <textarea
            value={qaState.testerNote}
            onChange={(e) => setMeta('testerNote', e.target.value)}
            placeholder="Optional notes about this test session"
            rows={2}
            className="w-full bg-transparent border border-border/40 rounded-lg px-1.5 py-1
              text-[10px] text-foreground placeholder:text-muted-foreground/30
              focus:outline-none focus:border-border/70 resize-none"
          />
        </div>
        {qaState.lastUpdated && (
          <p className="text-[9px] font-mono text-muted-foreground/35">
            Updated: {new Date(qaState.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Device runtime */}
      {deviceInfo && (
        <div className="px-3 pt-2 pb-1.5 border-b border-border/30">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide font-semibold mb-1.5">
            Runtime
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-[9px] font-mono text-muted-foreground/70">
              vw: <span className="text-sky-300">{deviceInfo.vw}px</span>
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/70">
              vh: <span className="text-sky-300">{deviceInfo.vh}px</span>
            </span>
            {deviceInfo.vvh !== null && (
              <span className="text-[9px] font-mono text-muted-foreground/70">
                vvh: <span className="text-sky-300">{deviceInfo.vvh}px</span>
              </span>
            )}
            <span className="text-[9px] font-mono text-muted-foreground/70">
              platform: <span className="text-sky-300">{deviceInfo.platform}</span>
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/70">
              mode: <span className="text-sky-300">{interfaceMode}</span>
            </span>
            {activeSheet && (
              <span className="text-[9px] font-mono text-muted-foreground/70">
                sheet: <span className="text-amber-300">{activeSheet}</span>
              </span>
            )}
            <span className="text-[9px] font-mono text-muted-foreground/70">
              bodyLock: <span className={deviceInfo.bodyLocked ? 'text-emerald-300' : 'text-muted-foreground/40'}>
                {deviceInfo.bodyLocked ? 'active' : 'off'}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="px-3 pt-2 pb-1">
        <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct * 100}%`,
              background: totalIssue > 0
                ? 'hsl(25 90% 55%)'
                : pct === 1
                ? 'hsl(152 58% 50%)'
                : 'hsl(192 65% 48%)',
            }}
          />
        </div>
        <div className="flex gap-2 mt-0.5">
          <span className="text-[8px] font-mono" style={{ color: 'hsl(152 58% 55%)' }}>{totalPass} pass</span>
          {totalIssue > 0 && (
            <span className="text-[8px] font-mono" style={{ color: 'hsl(25 90% 60%)' }}>{totalIssue} issue</span>
          )}
          <span className="text-[8px] font-mono text-muted-foreground/40">{totalUntested} untested</span>
        </div>
      </div>

      {/* Next untested button */}
      <div className="px-3 pb-2" data-qlpa-phone-qa-next="true">
        <button
          onClick={goNextUntested}
          className="w-full flex items-center justify-center gap-1.5 py-1 rounded-lg
            border border-border/40 text-[10px] font-medium text-muted-foreground
            hover:bg-muted/20 transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
          <span>{nextFocusFlash ? 'All items have been reviewed.' : 'Next untested'}</span>
        </button>
      </div>

      {/* Grouped checklist sections */}
      <div className="border-t border-border/30" data-qlpa-phone-qa-sections="true">
        {SECTIONS.map((section) => {
          const sectionItems = section.items;
          const sectionPass   = sectionItems.filter(({ key }) => qaState.checks[key]?.status === 'pass').length;
          const sectionIssue  = sectionItems.filter(({ key }) => qaState.checks[key]?.status === 'issue').length;
          const isCollapsed   = collapsedSections.has(section.id);

          return (
            <div key={section.id} className="border-b border-border/20 last:border-b-0">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-3 py-2 flex items-center gap-1.5 text-left
                  hover:bg-muted/10 transition-colors touch-manipulation"
                data-qlpa-section={section.id}
              >
                {isCollapsed
                  ? <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                  : <ChevronDown className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                }
                <span className="flex-1 text-[10px] font-semibold text-foreground/80">
                  {section.title}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/50">
                  {sectionPass}/{sectionItems.length} passed
                  {sectionIssue > 0 && (
                    <span style={{ color: 'hsl(25 90% 60%)' }}> · {sectionIssue} issue</span>
                  )}
                </span>
              </button>

              {/* Section items */}
              {!isCollapsed && (
                <div className="px-3 pb-2 pt-0.5 space-y-0">
                  {sectionItems.map(({ key, label }) => {
                    const item = qaState.checks[key] ?? { status: 'untested' as CheckStatus, note: '' };
                    const isIssue = item.status === 'issue';
                    const showNoteInput = isIssue && expandedIssue === key;

                    return (
                      <div key={key} className="py-0.5">
                        <button
                          ref={(el) => { itemRefs.current[key] = el; }}
                          onClick={() => cycleCheck(key)}
                          className="w-full flex items-center gap-2 py-1 text-left touch-manipulation
                            hover:opacity-80 active:scale-[0.99] transition-all"
                          data-qlpa-qa-item={key}
                        >
                          <StatusIcon status={item.status} />
                          <span className={`flex-1 text-[10px] leading-snug ${
                            item.status === 'pass'
                              ? 'text-muted-foreground/50 line-through'
                              : item.status === 'issue'
                              ? 'text-foreground/90'
                              : 'text-foreground/80'
                          }`}>
                            {label}
                          </span>
                          {isIssue && (
                            <span
                              className="text-[8px] font-mono px-1 py-0.5 rounded flex-shrink-0"
                              style={{ background: 'hsl(25 90% 50% / 0.15)', color: 'hsl(25 90% 60%)' }}
                            >
                              issue
                            </span>
                          )}
                        </button>

                        {/* Issue note */}
                        {isIssue && (
                          <div className="pl-5 pb-1">
                            <button
                              onClick={() => setExpandedIssue(showNoteInput ? null : key)}
                              className="text-[8px] text-muted-foreground/50 hover:text-muted-foreground/70 mb-0.5 underline underline-offset-1"
                            >
                              {showNoteInput ? 'Hide note' : 'Add issue note'}
                            </button>
                            {showNoteInput && (
                              <textarea
                                value={item.note ?? ''}
                                onChange={(e) => setNote(key, e.target.value)}
                                placeholder="Describe the issue…"
                                rows={2}
                                className="w-full bg-transparent border border-border/40 rounded-lg px-1.5 py-1
                                  text-[10px] text-foreground placeholder:text-muted-foreground/30
                                  focus:outline-none focus:border-border/60 resize-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            {!showNoteInput && item.note && (
                              <p className="text-[9px] text-muted-foreground/60 italic truncate">{item.note}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Export */}
      <div className="px-3 pt-2 pb-1 border-t border-border/30">
        <button
          onClick={copyReport}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl
            border text-[10px] font-medium transition-colors"
          style={copyFlash === 'copied'
            ? { borderColor: 'hsl(152 58% 46% / 0.5)', color: 'hsl(152 58% 62%)', background: 'hsl(152 58% 46% / 0.08)' }
            : {}}
          data-qlpa-phone-qa-copy="true"
        >
          {copyFlash === 'copied'
            ? <><Check className="w-3 h-3" /><span>Copied to clipboard</span></>
            : <><Copy className="w-3 h-3" /><span>Copy QA report</span></>
          }
        </button>

        {copyFlash === 'fallback' && (
          <div className="mt-1.5">
            <p className="text-[9px] text-muted-foreground/50 mb-1">Clipboard unavailable — copy manually:</p>
            <textarea
              ref={fallbackRef}
              value={fallbackText}
              readOnly
              rows={6}
              className="w-full bg-muted/20 border border-border/40 rounded-lg px-1.5 py-1
                text-[9px] font-mono text-foreground/80 focus:outline-none resize-none"
            />
            <button
              onClick={() => setCopyFlash('idle')}
              className="mt-1 text-[9px] text-muted-foreground/50 underline"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Pass 134 focus block */}
      <div className="px-3 pt-2.5 pb-2 border-t border-border/30" data-qlpa-pass134-focus="true">
        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide font-semibold mb-1.5">
          Pass 134 focus — verify on device
        </p>
        <ul className="space-y-0.5">
          {PASS134_FOCUS_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <span
                className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5"
                style={{ background: 'hsl(192 65% 48% / 0.55)' }}
              />
              <span className="text-[9px] text-muted-foreground/65 leading-snug">{item}</span>
            </li>
          ))}
        </ul>
        {/* Reset first-run hint */}
        <button
          onClick={resetFirstRunHint}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 rounded-lg
            border border-border/40 text-[10px] font-medium text-muted-foreground
            hover:bg-muted/20 transition-colors"
          data-qlpa-reset-first-run-hint="true"
        >
          <RotateCcw className="w-2.5 h-2.5 flex-shrink-0" />
          <span>{resetHintFlash ? 'First-run hint reset' : 'Reset first-run hint'}</span>
        </button>
      </div>

      {/* Go test flow checklist */}
      <div className="px-3 pt-2 pb-2 border-t border-border/30" data-qlpa-go-test-flow="true">
        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide font-semibold mb-1.5">
          Go test flow
        </p>
        <div className="space-y-0">
          {GO_TEST_FLOW_ITEMS.map(({ key, label }) => {
            const status = goTestFlow[key] ?? 'untested';
            return (
              <button
                key={key}
                onClick={() => cycleGoTestFlow(key)}
                className="w-full flex items-center gap-2 py-1 text-left touch-manipulation
                  hover:opacity-80 active:scale-[0.99] transition-all"
                data-qlpa-go-test-item={key}
              >
                <StatusIcon status={status} />
                <span className={`flex-1 text-[10px] leading-snug ${
                  status === 'pass'
                    ? 'text-muted-foreground/50 line-through'
                    : status === 'issue'
                    ? 'text-foreground/90'
                    : 'text-foreground/70'
                }`}>
                  {label}
                </span>
                {status === 'issue' && (
                  <span
                    className="text-[8px] font-mono px-1 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'hsl(25 90% 50% / 0.15)', color: 'hsl(25 90% 60%)' }}
                  >
                    issue
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual reset */}
      <div className="px-3 pb-3 pt-1 border-t border-border/30 flex gap-1.5">
        <button
          onClick={resetStatuses}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl
            border border-border text-[10px] font-medium text-muted-foreground
            hover:bg-muted/20 transition-colors"
          data-qlpa-phone-qa-reset="true"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>{resetFlash === 'statuses' ? 'Statuses cleared' : 'Reset checklist statuses'}</span>
        </button>
        <button
          onClick={resetAll}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl
            border border-border text-[10px] font-medium text-muted-foreground
            hover:bg-muted/20 transition-colors"
          data-qlpa-phone-qa-reset-all="true"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>{resetFlash === 'all' ? 'All data cleared' : 'Reset all Phone QA data'}</span>
        </button>
      </div>
    </div>
  );
}
