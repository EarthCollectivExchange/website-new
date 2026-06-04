/**
 * Complete Stats Analyzer — SCAFFOLD ONLY
 *
 * This module is a type-safe scaffold for future Complete Stats Mode.
 * It is NOT active yet. No heavy processing, no IndexedDB, no Web Worker.
 *
 * Complete Mode future goals:
 * - Local IndexedDB storage (persistent event log)
 * - Optional Web Worker for background aggregation
 * - Richer aggregation (daily/weekly summaries)
 * - Exportable stats JSON
 * - Never sends data to backend by default
 * - Never inspects message content
 */

import type { StatsEvent, StatsAggregates } from './statsTypes';
import { isFeatureEnabled } from '@/lib/foundation/featureFlags';

export interface CompleteStatsState {
  status: 'inactive' | 'loading' | 'ready' | 'error';
  eventCount: number;
  oldestEventAt: string | null;
  newestEventAt: string | null;
}

export const COMPLETE_STATS_INITIAL: CompleteStatsState = {
  status: 'inactive',
  eventCount: 0,
  oldestEventAt: null,
  newestEventAt: null,
};

/**
 * Initialize Complete Stats Mode.
 * Currently a no-op — scaffold only. Returns false until feature flag is enabled.
 */
export async function initCompleteStats(): Promise<boolean> {
  if (!isFeatureEnabled('completeStats')) {
    return false;
  }
  // Future: initialize IndexedDB, set up Web Worker
  return false;
}

/**
 * Record an event in Complete Stats Mode.
 * Currently a no-op — passes through to Light Mode until feature is active.
 */
export function recordCompleteEvent(_event: StatsEvent): void {
  // Scaffold — not active
}

/**
 * Get the complete stats state.
 */
export function getCompleteStatsState(): CompleteStatsState {
  return { ...COMPLETE_STATS_INITIAL };
}

/**
 * Export all complete stats as JSON.
 * Future feature — scaffold only.
 */
export async function exportCompleteStats(): Promise<StatsAggregates | null> {
  if (!isFeatureEnabled('completeStats')) return null;
  // Future: export from IndexedDB
  return null;
}
