// ─── QLPA Internal Test Diagnostics ─────────────────────────────────────────
//
// Local-only module for structured phone testing during pre-MVP founder testing.
//
// Design rules:
//   - Pure module. No network calls. No database writes. No external analytics.
//   - All records stay on-device. Nothing is sent to any server.
//   - Developer mode only. Never surfaces in Simple or Advanced user modes.
//   - Only log device behavior, layout issues, and UI observations.
//   - Never log message content, EarthID handles, or personal data.
//
// Reference: docs/QLPA_INTERNAL_TEST_DIAGNOSTICS.md

import type { DeviceRuntime } from './appOrchestrator';

// ─── Device and browser types ─────────────────────────────────────────────────

export type TestDeviceType =
  | 'iphone'
  | 'android'
  | 'desktop'
  | 'tablet'
  | 'unknown';

export type TestBrowser =
  | 'safari'
  | 'brave'
  | 'chrome'
  | 'firefox'
  | 'edge'
  | 'unknown';

// ─── Surface names (match QA script sections) ────────────────────────────────

export type TestSurface =
  | 'landing'
  | 'orb-panel'
  | 'messages-list'
  | 'conversation-view'
  | 'protected-sheet'
  | 'ready-sheet'
  | 'allowed-sheet'
  | 'conversation-tools'
  | 'members'
  | 'message-retention'
  | 'message-journey'
  | 'settings'
  | 'contacts'
  | 'trust'
  | 'new-conversation'
  | 'composer'
  | 'bottom-nav';

// ─── Issue classification ─────────────────────────────────────────────────────

export type TestIssueCategory =
  | 'scroll'
  | 'layout'
  | 'i18n'
  | 'touch'
  | 'overlay'
  | 'performance'
  | 'wording'
  | 'state'
  | 'safety'
  | 'unknown';

export type TestSeverity =
  | 'note'      // observation, no defect
  | 'minor'     // cosmetic or low-impact
  | 'major'     // broken behavior, has workaround
  | 'blocker';  // prevents testing or core use case

// ─── Diagnostic record ────────────────────────────────────────────────────────

export interface TestDiagnosticRecord {
  id: string;
  createdAt: string;           // ISO timestamp
  deviceType: TestDeviceType;
  browser: TestBrowser;
  surface: TestSurface;
  issueCategory: TestIssueCategory;
  severity: TestSeverity;
  description: string;
  expected: string;
  actual: string;
  screenshotNote?: string;
  appMode?: string;
  language?: string;
  interfaceDepth?: string;
  resolved?: boolean;
}

// ─── Record creation ──────────────────────────────────────────────────────────

export interface DiagnosticInput {
  deviceType?: TestDeviceType;
  browser?: TestBrowser;
  surface: TestSurface;
  issueCategory?: TestIssueCategory;
  severity?: TestSeverity;
  description: string;
  expected?: string;
  actual?: string;
  screenshotNote?: string;
  appMode?: string;
  language?: string;
  interfaceDepth?: string;
}

export function createDiagnosticRecord(input: DiagnosticInput): TestDiagnosticRecord {
  const now = new Date();
  const id = `diag_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    createdAt:      now.toISOString(),
    deviceType:     input.deviceType     ?? 'unknown',
    browser:        input.browser        ?? 'unknown',
    surface:        input.surface,
    issueCategory:  input.issueCategory  ?? 'unknown',
    severity:       input.severity       ?? 'note',
    description:    input.description,
    expected:       input.expected       ?? '',
    actual:         input.actual         ?? '',
    screenshotNote: input.screenshotNote,
    appMode:        input.appMode,
    language:       input.language,
    interfaceDepth: input.interfaceDepth,
    resolved:       false,
  };
}

// ─── Severity classification ──────────────────────────────────────────────────

export function classifyIssueSeverity(
  category: TestIssueCategory,
  description: string,
): TestSeverity {
  const lower = description.toLowerCase();

  // Safety issues always escalate
  if (category === 'safety') return 'blocker';

  // Overlay/state issues that prevent interaction
  if (category === 'overlay' || category === 'state') {
    if (lower.includes('crash') || lower.includes('freeze') || lower.includes('stuck')) {
      return 'blocker';
    }
    return 'major';
  }

  // Scroll issues: major on mobile, minor if cosmetic
  if (category === 'scroll') {
    if (lower.includes('cannot') || lower.includes('broken') || lower.includes('locked')) {
      return 'major';
    }
    return 'minor';
  }

  // i18n issues: minor (missing key = major)
  if (category === 'i18n') {
    if (lower.includes('missing') || lower.includes('raw key') || lower.includes('undefined')) {
      return 'major';
    }
    return 'minor';
  }

  // Performance: major if unusable, minor otherwise
  if (category === 'performance') {
    if (lower.includes('unusable') || lower.includes('unresponsive')) return 'major';
    return 'minor';
  }

  // Layout: minor by default, major if overflow clips interaction
  if (category === 'layout') {
    if (lower.includes('overflow') || lower.includes('clip') || lower.includes('unreachable')) {
      return 'major';
    }
    return 'minor';
  }

  return 'note';
}

// ─── Device runtime summary ───────────────────────────────────────────────────

export function getDeviceRuntimeSummary(runtime: DeviceRuntime): string {
  const parts: string[] = [];

  if (runtime.isIOS)     parts.push('iOS');
  if (runtime.isAndroid) parts.push('Android');
  if (!runtime.isIOS && !runtime.isAndroid) parts.push('Desktop');

  if (runtime.isSafari) parts.push('Safari');
  if (runtime.isBrave)  parts.push('Brave');

  if (runtime.isPWA) parts.push('PWA');
  if (runtime.prefersReducedMotion) parts.push('reduced-motion');
  if (runtime.hasSafeAreaSupport) parts.push('safe-area');

  parts.push(`vvh: ${runtime.visualViewportHeight ?? 'unknown'}px`);

  return parts.join(' · ') || 'unknown runtime';
}

// ─── Copy formatter ───────────────────────────────────────────────────────────

export function formatDiagnosticForCopy(record: TestDiagnosticRecord): string {
  const lines: string[] = [
    `EarthOS Diagnostics — ${record.createdAt}`,
    `ID: ${record.id}`,
    `Device: ${record.deviceType} / ${record.browser}`,
    `Surface: ${record.surface}`,
    `Category: ${record.issueCategory}`,
    `Severity: ${record.severity}`,
    `Description: ${record.description}`,
  ];

  if (record.expected) lines.push(`Expected: ${record.expected}`);
  if (record.actual)   lines.push(`Actual: ${record.actual}`);
  if (record.screenshotNote) lines.push(`Screenshot note: ${record.screenshotNote}`);
  if (record.appMode)        lines.push(`App mode: ${record.appMode}`);
  if (record.language)       lines.push(`Language: ${record.language}`);
  if (record.interfaceDepth) lines.push(`Interface: ${record.interfaceDepth}`);
  if (record.resolved)       lines.push(`Resolved: yes`);

  return lines.join('\n');
}
