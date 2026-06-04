/**
 * QLPA Net Shield Events
 * Ledger event type definitions for future audit and recovery flows.
 * No network calls, no destructive behavior, no remote actions yet.
 *
 * STATUS: FOUNDATION — types only. Event recording not yet wired.
 */

/** All Net Shield ledger event type identifiers. */
export type NetShieldEventType =
  | 'net_shield_enabled'
  | 'net_shield_level_changed'
  | 'access_pause_requested'
  | 'guardian_review_requested'
  | 'source_notice_prepared'
  | 'remote_delete_prepared'
  | 'recovery_flow_started';

/** A single Net Shield ledger event record. */
export interface NetShieldEvent {
  type: NetShieldEventType;
  conversationId: string;
  actorId?: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

/** Human-readable dev notes for each event type (not user-facing). */
export const NET_SHIELD_EVENT_NOTES: Record<NetShieldEventType, string> = {
  net_shield_enabled:         'User activated Net Shield for a conversation or context.',
  net_shield_level_changed:   'Protection level changed (e.g. protected → sealed).',
  access_pause_requested:     'Access to content paused pending identity confirmation.',
  guardian_review_requested:  'Guardian contact asked to review access. Future relay required.',
  source_notice_prepared:     'A calm notice to the source sender has been staged. Future relay required.',
  remote_delete_prepared:     'Remote delete has been staged. Will execute when relay is available.',
  recovery_flow_started:      'A calm recovery flow has been initiated for identity re-confirmation.',
};

/**
 * Build a Net Shield event record.
 * Does not write anywhere — caller is responsible for ledger recording.
 */
export function buildNetShieldEvent(
  type: NetShieldEventType,
  conversationId: string,
  actorId?: string,
  metadata?: Record<string, string | number | boolean>,
): NetShieldEvent {
  return {
    type,
    conversationId,
    actorId,
    timestamp: new Date().toISOString(),
    metadata,
  };
}
