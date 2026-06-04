/**
 * Stats Selectors
 * Derived views over the stats aggregates for display components.
 */

import type { StatsAggregates, StatsEvent } from './statsTypes';
import { format } from 'date-fns';

export interface StatsSummary {
  conversations: number;
  messages: number;
  files: number;
  voice: number;
  autoClears: number;
  exports: number;
  lastActive: string | null;
}

export function selectStatsSummary(aggregates: StatsAggregates): StatsSummary {
  return {
    conversations: aggregates.totalConversationsCreated,
    messages:      aggregates.totalMessagesSent,
    files:         aggregates.totalFilesShared,
    voice:         aggregates.totalVoiceMemos,
    autoClears:    aggregates.totalAutoClearsApplied,
    exports:       aggregates.totalExportsCreated,
    lastActive:    aggregates.lastActiveAt
      ? format(new Date(aggregates.lastActiveAt), 'MMM d, h:mm a')
      : null,
  };
}

/**
 * Group in-memory events by type for Developer mode display.
 */
export function groupEventsByType(events: StatsEvent[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const event of events) {
    result[event.type] = (result[event.type] ?? 0) + 1;
  }
  return result;
}
