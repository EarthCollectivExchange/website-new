/**
 * Stats Export
 * User-initiated export of local stats data.
 * No backend — local download only.
 */

import type { StatsAggregates } from './statsTypes';
import { getAggregates } from './statsStore';

export interface StatsExportPayload {
  exportedAt: string;
  version: string;
  mode: 'light';
  aggregates: StatsAggregates;
  privacyNote: string;
}

/**
 * Generate a stats export payload.
 * Light mode only in current implementation.
 */
export function generateStatsExport(): StatsExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    version: '0.1.0',
    mode: 'light',
    aggregates: getAggregates(),
    privacyNote: 'This export contains only aggregate counters. No message content, file content, voice content, or personal identifiers are included.',
  };
}

/**
 * Download stats as a JSON file (browser only).
 */
export function downloadStatsExport(): void {
  if (typeof window === 'undefined') return;
  const payload = generateStatsExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `earthos-stats-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
