/**
 * QLPA Net Shield Vocabulary
 * Calm, protective, neutral-positive language for Net Shield user-facing labels.
 * All labels map to i18n keys; raw strings here are for dev tooling only.
 *
 * QLPA rule: no fear words (danger, threat, attack, breach, destroy, kill, purge).
 * Preferred register: care, shield, pause, review, restore, source sender, trusted access.
 */

import type { NetShieldLevel, NetShieldAction, WrongAccessPolicy, NetShieldStatus } from './netShieldTypes';

/** i18n key map for each shield level. */
export const SHIELD_LEVEL_LABEL_KEYS: Record<NetShieldLevel, string> = {
  open:      'netShield.levels.open',
  protected: 'netShield.levels.protected',
  private:   'netShield.levels.private',
  sealed:    'netShield.levels.sealed',
  guardian:  'netShield.levels.guardian',
};

/** Dev-facing English descriptions (not user-facing UI; use i18n keys in components). */
export const SHIELD_LEVEL_DEV_NOTES: Record<NetShieldLevel, string> = {
  open:      'Default trust rules active. No additional local safeguards.',
  protected: 'Local encryption active. Content stays on device by default.',
  private:   'No relay without consent. Source notices prepared locally.',
  sealed:    'Full local sealing. No sync, no preview outside app.',
  guardian:  'Guardian-assisted care. Requires relay for full activation.',
};

/** i18n key map for each action. */
export const SHIELD_ACTION_LABEL_KEYS: Record<NetShieldAction, string> = {
  none:                   'netShield.actions.none',
  local_lock:             'netShield.actions.localLock',
  hide_content:           'netShield.actions.hideContent',
  request_recovery:       'netShield.actions.requestRecovery',
  notify_sender:          'netShield.actions.notifySource',
  prepare_remote_delete:  'netShield.actions.prepareRemoteDelete',
};

/** i18n key map for wrong-access policies. */
export const WRONG_ACCESS_LABEL_KEYS: Record<WrongAccessPolicy, string> = {
  ignore:           'netShield.policies.localOnly',
  pause_access:     'netShield.policies.localOnly',
  notify_source:    'netShield.policies.futureRelay',
  guardian_review:  'netShield.guardianReview',
};

/** i18n key map for shield status. */
export const SHIELD_STATUS_LABEL_KEYS: Record<NetShieldStatus, string> = {
  ready:                  'netShield.status.ready',
  needs_identity:         'netShield.status.needsIdentity',
  local_only:             'netShield.status.localOnly',
  future_relay_required:  'netShield.status.futureRelayRequired',
};

/** Calm tone descriptors used across protection flows (dev reference, not user-facing). */
export const CALM_VOCABULARY = {
  protection:       'protection',
  care:             'care',
  shield:           'shield',
  pause:            'pause',
  review:           'review',
  restore:          'restore',
  sourceSender:     'source sender',
  trustedAccess:    'trusted access',
  localSafeguard:   'local safeguard',
  guardianReview:   'guardian review',
  recoveryFlow:     'recovery flow',
  calmNotice:       'calm notice',
  relayReady:       'relay-ready',
} as const;
