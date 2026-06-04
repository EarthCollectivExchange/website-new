/**
 * Light Stats Analyzer
 * Local aggregate-only stats. No content, no backend, minimal bundle impact.
 *
 * Light Mode rules:
 * - Aggregate counters only (messages sent, files shared, etc.)
 * - Stored in localStorage
 * - In-memory event log (not persisted — cleared on reload)
 * - No raw event browser in Simple/Advanced view (Developer only)
 * - No charts, no heavy processing
 * - Bundle impact: minimal
 */

import { recordStatsEvent, getAggregates, getEventLog, clearStatsData } from './statsStore';
import { selectStatsSummary, groupEventsByType } from './statsSelectors';
import type { StatsEvent, StatsAggregates } from './statsTypes';
import type { StatsSummary } from './statsSelectors';

export { selectStatsSummary, groupEventsByType };

export type { StatsAggregates };

/** Record a stats event (respects mode and privacy guard) */
export { recordStatsEvent };

/** Get the current aggregate summary */
export function getLightSummary(): StatsSummary {
  return selectStatsSummary(getAggregates());
}

/** Get the raw aggregates (for developer display) */
export function getLightAggregates(): StatsAggregates {
  return getAggregates();
}

/** Get the in-memory event log (developer mode only) */
export function getLightEventLog(): StatsEvent[] {
  return getEventLog();
}

/** Clear all light stats data */
export function clearLightStats(): void {
  clearStatsData();
}
