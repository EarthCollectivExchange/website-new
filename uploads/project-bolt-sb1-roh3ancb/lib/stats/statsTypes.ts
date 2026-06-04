/**
 * EarthOS Stats Analyzer — Types
 *
 * PRIVACY LAW:
 * Stats must NEVER include:
 *   - message body / plaintext content
 *   - file names or file content
 *   - voice content
 *   - private keys or cryptographic material
 *   - contact names, email addresses, phone numbers
 *   - full file sizes (use buckets instead)
 *   - precise personal identifiers
 *
 * Stats MAY include:
 *   - counts and aggregates
 *   - mode/preference selections
 *   - conversation types (not content)
 *   - storage mode selections
 *   - size buckets (tiny/small/medium/large)
 *   - duration buckets (short/medium/long)
 *   - locale codes
 *   - success/failure booleans
 */

// ─── Stats Modes ──────────────────────────────────────────────────────────────

export type StatsMode = 'off' | 'light' | 'complete';

// ─── Event Types ──────────────────────────────────────────────────────────────

export type StatsEventType =
  | 'app_opened'
  | 'conversation_created'
  | 'message_sent'
  | 'file_prepared'
  | 'voice_recorded'
  | 'auto_clear_applied'
  | 'language_changed'
  | 'mode_changed'
  | 'preference_changed'
  | 'export_created'
  | 'local_clear_applied'
  | 'qlpa_term_detected_dev_only'; // Developer mode only — never in production stats

// ─── Data Classes ─────────────────────────────────────────────────────────────

export type StatsDataClass =
  | 'operational'        // Core app functions (message sent, conversation created)
  | 'preference'         // Mode/locale/interface preference changes
  | 'privacy_event'      // Clear, export, consent actions
  | 'performance'        // Duration, timing aggregates
  | 'developer_diagnostic'; // Dev-mode only — never exposed to regular users

// ─── Size Buckets ─────────────────────────────────────────────────────────────

export type SizeBucket = 'tiny' | 'small' | 'medium' | 'large';

export const SIZE_BUCKET_RANGES: Record<SizeBucket, { minBytes: number; maxBytes: number }> = {
  tiny:   { minBytes: 0,          maxBytes: 10_240 },      // 0–10KB
  small:  { minBytes: 10_240,     maxBytes: 1_048_576 },   // 10KB–1MB
  medium: { minBytes: 1_048_576,  maxBytes: 10_485_760 },  // 1MB–10MB
  large:  { minBytes: 10_485_760, maxBytes: Infinity },    // 10MB+
};

export function getSizeBucket(bytes: number): SizeBucket {
  if (bytes < SIZE_BUCKET_RANGES.small.minBytes) return 'tiny';
  if (bytes < SIZE_BUCKET_RANGES.medium.minBytes) return 'small';
  if (bytes < SIZE_BUCKET_RANGES.large.minBytes) return 'medium';
  return 'large';
}

// ─── Duration Buckets ─────────────────────────────────────────────────────────

export type DurationBucket = 'instant' | 'short' | 'medium' | 'long';

export function getDurationBucket(ms: number): DurationBucket {
  if (ms < 500)    return 'instant';
  if (ms < 3_000)  return 'short';
  if (ms < 10_000) return 'medium';
  return 'long';
}

// ─── Stats Event ──────────────────────────────────────────────────────────────

export interface StatsEvent {
  id: string;
  type: StatsEventType;
  timestamp: string; // ISO 8601
  dataClass: StatsDataClass;

  // Optional context — all are type/category only, never personal identifiers
  conversationType?: string;
  storageMode?: string;
  interfaceDepth?: string;
  humanMode?: string;
  locale?: string;
  durationMs?: number;    // Use getDurationBucket() for display, not raw value
  sizeBucket?: SizeBucket;
  success?: boolean;
}

// ─── Aggregate Counters (Light Mode) ─────────────────────────────────────────

export interface StatsAggregates {
  totalSessions: number;
  totalMessagesSent: number;
  totalConversationsCreated: number;
  totalFilesShared: number;
  totalVoiceMemos: number;
  totalAutoClearsApplied: number;
  totalExportsCreated: number;
  lastActiveAt: string | null;
}

export const EMPTY_AGGREGATES: StatsAggregates = {
  totalSessions: 0,
  totalMessagesSent: 0,
  totalConversationsCreated: 0,
  totalFilesShared: 0,
  totalVoiceMemos: 0,
  totalAutoClearsApplied: 0,
  totalExportsCreated: 0,
  lastActiveAt: null,
};
