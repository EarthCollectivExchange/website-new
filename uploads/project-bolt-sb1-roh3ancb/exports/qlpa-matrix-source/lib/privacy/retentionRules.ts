/**
 * Retention Rules
 * Defines valid auto-clear durations and their honest descriptions.
 * All retention is local-device only in v0.1.
 */

export type RetentionPeriod =
  | 'off'
  | '30s'
  | '1min'
  | '5min'
  | '1h'
  | '24h'
  | '7d'
  | 'custom';

export interface RetentionRule {
  period: RetentionPeriod;
  ms: number | null; // null = off
  labelKey: string;
  sublabelKey: string;
}

export const RETENTION_RULES: RetentionRule[] = [
  { period: 'off',    ms: null,         labelKey: 'retention.off',    sublabelKey: 'retention.offSublabel' },
  { period: '30s',    ms: 30_000,       labelKey: 'retention.30s',    sublabelKey: 'retention.30sSublabel' },
  { period: '1min',   ms: 60_000,       labelKey: 'retention.1min',   sublabelKey: 'retention.1minSublabel' },
  { period: '5min',   ms: 300_000,      labelKey: 'retention.5min',   sublabelKey: 'retention.5min' },
  { period: '1h',     ms: 3_600_000,    labelKey: 'retention.1h',     sublabelKey: 'retention.1hSublabel' },
  { period: '24h',    ms: 86_400_000,   labelKey: 'retention.24h',    sublabelKey: 'retention.24hSublabel' },
  { period: '7d',     ms: 604_800_000,  labelKey: 'retention.7d',     sublabelKey: 'retention.7dSublabel' },
  { period: 'custom', ms: null,         labelKey: 'retention.custom', sublabelKey: 'retention.customSublabel' },
];

export const MIN_RETENTION_MS = 30_000;
export const MAX_RETENTION_MS = 604_800_000; // 7 days

export function isValidCustomRetentionMs(ms: number): boolean {
  return ms >= MIN_RETENTION_MS && ms <= MAX_RETENTION_MS;
}
