/**
 * Stats Store
 * Local storage backend for Light Stats Mode.
 * Persists aggregate counters to localStorage.
 * Raw event log is in-memory only (cleared on reload).
 */

import type { StatsEvent, StatsAggregates, StatsMode } from './statsTypes';
import { EMPTY_AGGREGATES } from './statsTypes';
import { validateStatsEvent } from './statsPrivacy';
import { STORAGE_KEYS } from '@/lib/foundation/appConstants';

const STATS_KEY = 'earthos.stats.aggregates';
const MAX_IN_MEMORY_EVENTS = 200;

// ─── In-memory event log (Light Mode) ────────────────────────────────────────

let eventLog: StatsEvent[] = [];

// ─── Aggregates (persisted) ───────────────────────────────────────────────────

function loadAggregates(): StatsAggregates {
  if (typeof window === 'undefined') return { ...EMPTY_AGGREGATES };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...EMPTY_AGGREGATES };
    return { ...EMPTY_AGGREGATES, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_AGGREGATES };
  }
}

function saveAggregates(aggregates: StatsAggregates): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(aggregates));
  } catch {
    // Storage quota — silently skip stats write
  }
}

// ─── Stats Mode ───────────────────────────────────────────────────────────────

export function loadStatsMode(): StatsMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEYS.statsMode) as StatsMode | null;
  if (stored === 'off' || stored === 'light' || stored === 'complete') return stored;
  return 'light';
}

export function saveStatsMode(mode: StatsMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.statsMode, mode);
}

// ─── Event recording ──────────────────────────────────────────────────────────

export function recordStatsEvent(event: StatsEvent): void {
  const mode = loadStatsMode();
  if (mode === 'off') return;

  const validation = validateStatsEvent(event);
  if (!validation.valid) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[stats] Privacy violation blocked event:', validation.violations);
    }
    return;
  }

  // Add to in-memory log (capped)
  eventLog.push(event);
  if (eventLog.length > MAX_IN_MEMORY_EVENTS) {
    eventLog = eventLog.slice(-MAX_IN_MEMORY_EVENTS);
  }

  // Update persisted aggregates
  updateAggregates(event);
}

function updateAggregates(event: StatsEvent): void {
  const agg = loadAggregates();
  agg.lastActiveAt = event.timestamp;

  switch (event.type) {
    case 'app_opened':           agg.totalSessions++;            break;
    case 'message_sent':         agg.totalMessagesSent++;        break;
    case 'conversation_created': agg.totalConversationsCreated++; break;
    case 'file_prepared':        agg.totalFilesShared++;         break;
    case 'voice_recorded':       agg.totalVoiceMemos++;          break;
    case 'auto_clear_applied':   agg.totalAutoClearsApplied++;   break;
    case 'export_created':       agg.totalExportsCreated++;      break;
  }

  saveAggregates(agg);
}

// ─── Read access ──────────────────────────────────────────────────────────────

export function getAggregates(): StatsAggregates {
  return loadAggregates();
}

export function getEventLog(): StatsEvent[] {
  return [...eventLog];
}

export function clearStatsData(): void {
  eventLog = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STATS_KEY);
  }
}
