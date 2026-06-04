/**
 * Stats Events — Factory helpers
 * Typed constructors for each stats event type.
 * Use these instead of building event objects manually.
 */

import type { StatsEvent, StatsEventType, StatsDataClass, SizeBucket } from './statsTypes';
import { getSizeBucket } from './statsTypes';

function makeId(): string {
  return `se-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function now(): string {
  return new Date().toISOString();
}

function event(
  type: StatsEventType,
  dataClass: StatsDataClass,
  extras: Partial<Omit<StatsEvent, 'id' | 'type' | 'timestamp' | 'dataClass'>> = {},
): StatsEvent {
  return { id: makeId(), type, timestamp: now(), dataClass, ...extras };
}

// ─── Event constructors ───────────────────────────────────────────────────────

export function statsAppOpened(): StatsEvent {
  return event('app_opened', 'operational');
}

export function statsConversationCreated(opts: {
  conversationType: string;
  storageMode: string;
  humanMode: string;
  interfaceDepth: string;
}): StatsEvent {
  return event('conversation_created', 'operational', opts);
}

export function statsMessageSent(opts: {
  conversationType?: string;
  storageMode?: string;
  humanMode?: string;
  success: boolean;
}): StatsEvent {
  return event('message_sent', 'operational', opts);
}

export function statsFilePrepared(opts: {
  storageMode?: string;
  fileSizeBytes?: number;
  success: boolean;
}): StatsEvent {
  const sizeBucket: SizeBucket | undefined = opts.fileSizeBytes !== undefined
    ? getSizeBucket(opts.fileSizeBytes)
    : undefined;
  return event('file_prepared', 'operational', {
    storageMode: opts.storageMode,
    sizeBucket,
    success: opts.success,
  });
}

export function statsVoiceRecorded(opts: {
  durationMs?: number;
  success: boolean;
}): StatsEvent {
  return event('voice_recorded', 'operational', opts);
}

export function statsAutoClearApplied(opts: {
  conversationType?: string;
}): StatsEvent {
  return event('auto_clear_applied', 'privacy_event', opts);
}

export function statsLanguageChanged(opts: {
  locale: string;
}): StatsEvent {
  return event('language_changed', 'preference', opts);
}

export function statsModeChanged(opts: {
  humanMode?: string;
  interfaceDepth?: string;
}): StatsEvent {
  return event('mode_changed', 'preference', opts);
}

export function statsExportCreated(): StatsEvent {
  return event('export_created', 'privacy_event');
}

export function statsLocalClearApplied(): StatsEvent {
  return event('local_clear_applied', 'privacy_event');
}
