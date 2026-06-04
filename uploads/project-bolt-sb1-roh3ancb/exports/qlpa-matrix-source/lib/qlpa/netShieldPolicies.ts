/**
 * QLPA Net Shield Policies
 * Default policy objects for each protection tier.
 * These describe intended behavior only — no runtime enforcement yet.
 *
 * STATUS: FOUNDATION — policies are defined but not connected to behavior.
 */

import type { NetShieldPolicy } from './netShieldTypes';

/**
 * Default policy for standard protected conversations.
 * Local encryption active; no relay required for basic protection.
 */
export const DEFAULT_NET_SHIELD_POLICY: NetShieldPolicy = {
  level: 'protected',
  allowedActions: ['none', 'hide_content'],
  wrongAccessPolicy: 'pause_access',
  canNotifySourceSender: false,
  canPrepareRemoteDelete: false,
  requiresIdentity: false,
  requiresRelay: false,
  keepsContentLocal: true,
};

/**
 * Policy for conversations operating in full local-only mode.
 * No relay, no sync. Content never leaves device.
 */
export const LOCAL_ONLY_NET_SHIELD_POLICY: NetShieldPolicy = {
  level: 'private',
  allowedActions: ['none', 'local_lock', 'hide_content', 'request_recovery'],
  wrongAccessPolicy: 'pause_access',
  canNotifySourceSender: false,
  canPrepareRemoteDelete: false,
  requiresIdentity: false,
  requiresRelay: false,
  keepsContentLocal: true,
};

/**
 * Policy for future relay-backed protection.
 * Source notices and remote delete staging become possible when relay is available.
 * Until relay is confirmed, falls back to local-only behavior.
 */
export const FUTURE_RELAY_NET_SHIELD_POLICY: NetShieldPolicy = {
  level: 'sealed',
  allowedActions: ['none', 'local_lock', 'hide_content', 'request_recovery', 'notify_sender', 'prepare_remote_delete'],
  wrongAccessPolicy: 'notify_source',
  canNotifySourceSender: true,
  canPrepareRemoteDelete: true,
  requiresIdentity: true,
  requiresRelay: true,
  keepsContentLocal: true,
};

/** All built-in policies indexed by a readable key. */
export const NET_SHIELD_POLICIES = {
  default:       DEFAULT_NET_SHIELD_POLICY,
  local_only:    LOCAL_ONLY_NET_SHIELD_POLICY,
  future_relay:  FUTURE_RELAY_NET_SHIELD_POLICY,
} as const;

export type NetShieldPolicyKey = keyof typeof NET_SHIELD_POLICIES;
