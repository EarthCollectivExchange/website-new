/**
 * QLPA Net Shield Readiness
 * Helper functions for evaluating protection readiness in a given app context.
 * Returns typed objects and i18n keys only — no UI, no network calls.
 *
 * STATUS: FOUNDATION — logic is defined but not yet wired to the live app state.
 */

import type { NetShieldLevel, NetShieldPolicy, NetShieldStatus } from './netShieldTypes';
import type { InterfaceDepth } from '../foundation/modes';
import { SHIELD_STATUS_LABEL_KEYS } from './netShieldVocabulary';

export interface NetShieldReadinessResult {
  status: NetShieldStatus;
  labelKey: string;
  canActivate: boolean;
  blockedReasonKey?: string;
}

/**
 * Evaluate whether a given policy is ready to activate in the current app mode.
 * Returns a typed readiness result with i18n label keys.
 */
export function getNetShieldReadiness(
  policy: NetShieldPolicy,
  appMode: InterfaceDepth,
): NetShieldReadinessResult {
  if (policy.requiresRelay) {
    return {
      status: 'future_relay_required',
      labelKey: SHIELD_STATUS_LABEL_KEYS.future_relay_required,
      canActivate: false,
      blockedReasonKey: 'netShield.status.futureRelayRequired',
    };
  }

  if (policy.requiresIdentity && appMode === 'simple') {
    return {
      status: 'needs_identity',
      labelKey: SHIELD_STATUS_LABEL_KEYS.needs_identity,
      canActivate: false,
      blockedReasonKey: 'netShield.status.needsIdentity',
    };
  }

  if (policy.keepsContentLocal && !policy.requiresRelay) {
    return {
      status: 'local_only',
      labelKey: SHIELD_STATUS_LABEL_KEYS.local_only,
      canActivate: true,
    };
  }

  return {
    status: 'ready',
    labelKey: SHIELD_STATUS_LABEL_KEYS.ready,
    canActivate: true,
  };
}

/**
 * Whether a given shield level is usable in the current interface depth.
 * Guardian and sealed levels require advanced or developer mode.
 */
export function canUseNetShieldLevel(
  level: NetShieldLevel,
  appMode: InterfaceDepth,
): boolean {
  if (level === 'guardian' || level === 'sealed') {
    return appMode === 'advanced' || appMode === 'developer';
  }
  return true;
}

/**
 * Return a structured description of a shield status.
 * Provides both an i18n key and a stable dev-facing string.
 */
export function describeNetShieldStatus(status: NetShieldStatus): {
  labelKey: string;
  devLabel: string;
} {
  const DEV_LABELS: Record<NetShieldStatus, string> = {
    ready:                  'Shield ready — all required capabilities in place.',
    needs_identity:         'Shield needs EarthID to activate full protection.',
    local_only:             'Operating in local-safeguard mode. No relay active.',
    future_relay_required:  'Full shield requires relay. Foundation is set locally.',
  };

  return {
    labelKey: SHIELD_STATUS_LABEL_KEYS[status],
    devLabel: DEV_LABELS[status],
  };
}
