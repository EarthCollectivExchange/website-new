/**
 * QLPA Stats Modes
 * Defines the three stats operating modes with human-readable descriptions.
 * This file is safe to include in any QLPA Matrix Source project.
 */

import type { StatsMode } from './statsTypes';

export interface StatsModeDefinition {
  key: StatsMode;
  labelKey: string;
  descriptionKey: string;
  privacyLevel: 'maximum' | 'aggregate_only' | 'enriched_local';
  isScaffold: boolean;
}

export const STATS_MODE_DEFINITIONS: StatsModeDefinition[] = [
  {
    key: 'off',
    labelKey: 'stats.mode.off',
    descriptionKey: 'stats.mode.offDesc',
    privacyLevel: 'maximum',
    isScaffold: false,
  },
  {
    key: 'light',
    labelKey: 'stats.mode.light',
    descriptionKey: 'stats.mode.lightDesc',
    privacyLevel: 'aggregate_only',
    isScaffold: false,
  },
  {
    key: 'complete',
    labelKey: 'stats.mode.complete',
    descriptionKey: 'stats.mode.completeDesc',
    privacyLevel: 'enriched_local',
    isScaffold: true,
  },
];

export function getStatsModeDefinition(mode: StatsMode): StatsModeDefinition {
  return STATS_MODE_DEFINITIONS.find((d) => d.key === mode) ?? STATS_MODE_DEFINITIONS[0];
}

export const STATS_MODE_ORDER: StatsMode[] = ['off', 'light', 'complete'];
